import asyncio
import time
import uuid
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.database.models import Execution, AuditLog, Lead
from backend.app.agents.registry import agent_registry
from backend.app.tools.registry import tool_registry
from backend.app.memory.engine import MemoryEngine

class ExecutionEngine:
    def __init__(self, db: Session):
        self.db = db

    async def execute_workflow(self, workflow_id: Optional[int], dag: List[Dict[str, Any]], global_config: Dict[str, Any]) -> str:
        # Create execution record
        execution_id = str(uuid.uuid4())
        
        # Populate initial step statuses in JSON
        step_status = {}
        for step in dag:
            step_status[step["task_id"]] = {
                "status": "PENDING",
                "agent_name": step["agent_name"],
                "dependencies": step["dependencies"],
                "start_time": None,
                "end_time": None,
                "latency": 0.0,
                "memory_hit": False,
                "error": None
            }
            
        execution = Execution(
            id=execution_id,
            workflow_id=workflow_id,
            status="RUNNING",
            current_step="Starting",
            step_status_json=None, # will use property setters
            result_summary_json="{}",
            memory_hits=0,
            execution_time=0.0,
            created_at=datetime.utcnow()
        )
        execution.step_status = step_status
        self.db.add(execution)
        self.db.commit()

        # Start execution in background so API is non-blocking
        asyncio.create_task(self._run_dag(execution_id, dag, global_config))
        
        return execution_id

    async def _run_dag(self, execution_id: str, dag: List[Dict[str, Any]], global_config: Dict[str, Any]):
        # Setup memory engine
        memory = MemoryEngine(self.db, execution_id=execution_id)
        
        # Store global parameters in short term memory
        for k, v in global_config.items():
            memory.set_short_term(f"global.{k}", v)

        # Audit start log
        self._log_audit(execution_id, "Planner", "INFO", "Planner formulated Directed Acyclic Graph (DAG) for target objective.", dag)

        start_time = time.time()
        
        # Keep track of task outputs
        task_outputs: Dict[str, Dict[str, Any]] = {}
        
        # Simple topological sort resolver
        pending_tasks = {step["task_id"]: step for step in dag}
        completed_tasks = set()
        failed_tasks = set()
        
        while pending_tasks:
            # Find tasks where all dependencies are completed
            ready_tasks = []
            for task_id, step in pending_tasks.items():
                deps = step["dependencies"]
                # If dependencies have failed, cancel this task
                if any(dep in failed_tasks for dep in deps):
                    self._update_task_status(execution_id, task_id, "CANCELLED", error="Dependency failed")
                    completed_tasks.add(task_id) # mark complete to exit loop
                    continue
                # If dependencies are satisfied, add to run list
                if all(dep in completed_tasks for dep in deps):
                    ready_tasks.append(step)
            
            if not ready_tasks and pending_tasks:
                # Cycle or deadlocked dependencies, break out
                self._log_audit(execution_id, "ExecutionEngine", "ERROR", "Deadlocked task graph or cycle detected.")
                break
                
            # Execute ready tasks (run sequentially for predictability or gather for parallel branches)
            # To support visual parallel logs, we can process them concurrently
            tasks_to_run = []
            for step in ready_tasks:
                task_id = step["task_id"]
                del pending_tasks[task_id]
                tasks_to_run.append(self._run_task(execution_id, step, task_outputs, memory))
                
            # Wait for this level of tasks to complete
            results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
            
            for task_id, success, output in results:
                if success:
                    completed_tasks.add(task_id)
                    task_outputs[task_id] = output
                else:
                    failed_tasks.add(task_id)
                    completed_tasks.add(task_id) # also complete to unlock loop
                    # If critical agent fails, we stop
                    
        # Concluding execution
        end_time = time.time()
        duration = round(end_time - start_time, 2)
        
        # Fetch updated record
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            execution.execution_time = duration
            execution.completed_at = datetime.utcnow()
            
            if failed_tasks:
                execution.status = "FAILED"
                execution.current_step = "Execution Failed"
                self._log_audit(execution_id, "ExecutionEngine", "ERROR", f"Execution finished with errors in {duration}s.")
            else:
                execution.status = "WAITING_APPROVAL" # Always wait for human review in Sales funnels
                execution.current_step = "Completed. Waiting for Review"
                self._log_audit(execution_id, "ExecutionEngine", "SUCCESS", f"Execution succeeded. Generated pipeline awaiting human approval.", {"duration_sec": duration})
                
                # Write finalized leads to database Lead table
                # Extract leads from recommendation task outputs
                rec_task_out = task_outputs.get("recommendation_task", {})
                leads_list = rec_task_out.get("recommendations", [])
                
                for l in leads_list:
                    new_lead = Lead(
                        execution_id=execution_id,
                        company_name=l.get("company_name"),
                        domain=l.get("domain"),
                        industry=l.get("industry"),
                        company_size=l.get("company_size"),
                        location=l.get("location"),
                        tech_stack=l.get("tech_stack"),
                        funding_status=l.get("funding_status"),
                        hiring_status=l.get("hiring_status"),
                        decision_maker_name=l.get("name"),
                        decision_maker_role=l.get("role"),
                        decision_maker_email=l.get("email"),
                        decision_maker_linkedin=l.get("linkedin"),
                        confidence_score=l.get("confidence_score"),
                        recommendation_reason=l.get("recommendation_reason"),
                        status="PENDING_APPROVAL"
                    )
                    self.db.add(new_lead)
                
            self.db.commit()

    async def _run_task(self, execution_id: str, step: Dict[str, Any], task_outputs: Dict[str, Any], memory: MemoryEngine) -> tuple:
        task_id = step["task_id"]
        agent_name = step["agent_name"]
        input_mapping = step["input_mapping"]
        
        agent = agent_registry.get_agent(agent_name)
        if not agent:
            error_msg = f"Agent '{agent_name}' not found in registry."
            self._update_task_status(execution_id, task_id, "FAILED", error=error_msg)
            return (task_id, False, {"error": error_msg})
            
        self._update_task_status(execution_id, task_id, "RUNNING")
        self._log_audit(execution_id, agent_name, "INFO", f"Agent '{agent_name}' activated for task '{task_id}'.")
        
        # Resolve inputs using mappings
        resolved_inputs = {}
        for param, mapping_str in input_mapping.items():
            if "." in mapping_str:
                source_task, output_key = mapping_str.split(".", 1)
                if source_task == "global":
                    resolved_inputs[param] = memory.get_short_term(f"global.{output_key}")
                else:
                    parent_output = task_outputs.get(source_task, {})
                    resolved_inputs[param] = parent_output.get(output_key)
            else:
                resolved_inputs[param] = mapping_str
                
        # Fill missing parameters from global workspace configs if not mapped
        if agent_name == "company_discovery":
            if "industry" not in resolved_inputs:
                resolved_inputs["industry"] = memory.get_short_term("global.industry", "IT")
            if "location" not in resolved_inputs:
                resolved_inputs["location"] = memory.get_short_term("global.location", "London")
            if "keywords" not in resolved_inputs:
                resolved_inputs["keywords"] = memory.get_short_term("global.keywords", [])
                
        task_start = time.time()
        
        # Implement Retries policy
        max_retries = agent.retry_policy.get("max_retries", 3)
        backoff = agent.retry_policy.get("backoff_factor", 2.0)
        
        output_data = {}
        success = False
        error_info = None
        
        for attempt in range(max_retries):
            try:
                # Add delay if retry
                if attempt > 0:
                    await asyncio.sleep(backoff ** attempt)
                    
                output_data = await agent.run(resolved_inputs, memory, tool_registry)
                success = True
                break
            except Exception as e:
                error_info = str(e)
                traceback.print_exc()
                self._log_audit(
                    execution_id, 
                    agent_name, 
                    "WARNING", 
                    f"Attempt {attempt+1} failed with error: {error_info}. Retrying..."
                )
                
        task_end = time.time()
        latency = round(task_end - task_start, 2)
        
        if success:
            self._update_task_status(execution_id, task_id, "COMPLETED", latency=latency)
            self._log_audit(execution_id, agent_name, "SUCCESS", f"Agent '{agent_name}' completed task '{task_id}' in {latency}s.", output_data)
            return (task_id, True, output_data)
        else:
            self._update_task_status(execution_id, task_id, "FAILED", latency=latency, error=error_info)
            self._log_audit(execution_id, agent_name, "ERROR", f"Agent '{agent_name}' failed task '{task_id}' after {max_retries} attempts. Error: {error_info}")
            return (task_id, False, {"error": error_info})

    def _update_task_status(self, execution_id: str, task_id: str, status: str, latency: float = 0.0, error: str = None):
        exec_record = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if exec_record:
            step_status = exec_record.step_status
            if task_id in step_status:
                step_status[task_id]["status"] = status
                if status == "RUNNING":
                    step_status[task_id]["start_time"] = datetime.utcnow().isoformat()
                    exec_record.current_step = step_status[task_id]["agent_name"]
                elif status in ["COMPLETED", "FAILED", "CANCELLED"]:
                    step_status[task_id]["end_time"] = datetime.utcnow().isoformat()
                    step_status[task_id]["latency"] = latency
                    step_status[task_id]["error"] = error
                    
            exec_record.step_status = step_status
            self.db.commit()

    def _log_audit(self, execution_id: str, agent_name: str, level: str, message: str, payload: Dict[str, Any] = {}):
        log = AuditLog(
            execution_id=execution_id,
            agent_name=agent_name,
            log_level=level,
            message=message,
            data_payload=payload
        )
        self.db.add(log)
        self.db.commit()
