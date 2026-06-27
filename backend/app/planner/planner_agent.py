from typing import Dict, Any, List
from backend.app.agents.registry import agent_registry

class TaskNode:
    def __init__(self, task_id: str, agent_name: str, dependencies: List[str], input_mapping: Dict[str, str]):
        self.task_id = task_id
        self.agent_name = agent_name
        self.dependencies = dependencies
        self.input_mapping = input_mapping # maps parent output key to child input key

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "agent_name": self.agent_name,
            "dependencies": self.dependencies,
            "input_mapping": self.input_mapping
        }

class PlannerAgent:
    def __init__(self):
        pass

    def plan_workflow(self, objective: str, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        # This is the enterprise Planner logic. It dynamically builds a graph of execution
        # depending on target settings. It inspects what agents are registered and matches capabilities.
        
        # Step 1: Discover available agent metadata
        available_agents = {a["name"]: a for a in agent_registry.list_agents()}
        
        # Step 2: Formulate the DAG nodes
        # A standard enterprise sales pipeline has:
        # Discovery -> Validation -> Enrichment -> DecisionMaker -> ContactEnrichment -> Recommendation -> Report
        
        dag: List[TaskNode] = []
        
        # We always check if our core agents are in the registry to build the graph
        if "company_discovery" in available_agents:
            dag.append(TaskNode(
                task_id="discovery_task",
                agent_name="company_discovery",
                dependencies=[],
                input_mapping={} # Takes global workflow config inputs
            ))
            
        if "company_validation" in available_agents:
            dag.append(TaskNode(
                task_id="validation_task",
                agent_name="company_validation",
                dependencies=["discovery_task"] if "company_discovery" in available_agents else [],
                input_mapping={"companies": "discovery_task.companies"}
            ))
            
        if "company_enrichment" in available_agents:
            dag.append(TaskNode(
                task_id="enrichment_task",
                agent_name="company_enrichment",
                dependencies=["validation_task"] if "company_validation" in available_agents else [],
                input_mapping={"companies": "validation_task.validated_companies"}
            ))

        # Parallel branches or dependent? 
        # Decision Maker needs enriched company details
        if "decision_maker" in available_agents:
            dag.append(TaskNode(
                task_id="decision_maker_task",
                agent_name="decision_maker",
                dependencies=["enrichment_task"] if "company_enrichment" in available_agents else [],
                input_mapping={
                    "companies": "enrichment_task.enriched_companies",
                    "target_personas": "global.target_personas" # Pulls from global configs
                }
            ))
            
        if "contact_enrichment" in available_agents:
            dag.append(TaskNode(
                task_id="contact_task",
                agent_name="contact_enrichment",
                dependencies=["decision_maker_task"] if "decision_maker" in available_agents else [],
                input_mapping={"decision_makers": "decision_maker_task.decision_makers"}
            ))
            
        if "recommendation" in available_agents:
            dag.append(TaskNode(
                task_id="recommendation_task",
                agent_name="recommendation",
                dependencies=["contact_task", "enrichment_task"],
                input_mapping={
                    "contacts": "contact_task.contacts",
                    "enriched_companies": "enrichment_task.enriched_companies"
                }
            ))
            
        if "report_generator" in available_agents:
            dag.append(TaskNode(
                task_id="report_task",
                agent_name="report_generator",
                dependencies=["recommendation_task"],
                input_mapping={
                    "leads": "recommendation_task.recommendations",
                    "formats": "global.formats"
                }
            ))

        return [node.to_dict() for node in dag]

planner_agent = PlannerAgent()
