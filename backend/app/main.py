import os
import json
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

# Database, models, and schemas
from backend.app.database.connection import engine, get_db, Base
import backend.app.database.models as models
import backend.app.schemas.schemas as schemas

# Engine modules
from backend.app.agents.registry import agent_registry
from backend.app.tools.registry import tool_registry
from backend.app.planner.planner_agent import planner_agent
from backend.app.execution.engine import ExecutionEngine
from backend.app.memory.engine import MemoryEngine

# Import packages to trigger registration triggers
import backend.app.agents
import backend.app.tools

# Initialize FastAPI App
app = FastAPI(
    title="ProspectPilot AI Platform API",
    description="Enterprise Agentic Sales Intelligence Orchestration Gateway",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount exports directory for downloads
os.makedirs("./exports", exist_ok=True)
app.mount("/exports", StaticFiles(directory="./exports"), name="exports")

# Database setup and pre-seeding
@app.on_event("startup")
def startup_db_seed():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        # Pre-seed a default workflow if empty
        if db.query(models.Workflow).count() == 0:
            default_config = {
                "industry": "AI & Software Engineering",
                "location": "London, United Kingdom",
                "min_size": 20,
                "target_technologies": ["React", "Python", "FastAPI", "PyTorch"],
                "target_personas": ["CTO", "VP of Engineering", "VP Engineering", "Head of AI"],
                "formats": ["csv", "json"]
            }
            default_workflow = models.Workflow(
                name="AI Engineer Sourcing Funnel",
                description="Discover high-growth AI SaaS providers hiring engineering talent in London.",
                config_json=json.dumps(default_config),
                is_active=True
            )
            db.add(default_workflow)
            db.commit()
            
        # Seed some mock data in Long-Term Memory to demonstrate Memory Hits instantly
        if db.query(models.MemoryEntry).count() == 0:
            # Seed a company we processed previously
            cached_company = {
                "name": "Cognitive Nexus",
                "domain": "cognitivenexus.com",
                "industry": "AI & Robotic Process Automation",
                "company_size": "15 employees",
                "location": "London, United Kingdom",
                "tech_stack": "React, Python, FastAPI, PyTorch, Kubernetes",
                "funding_status": "Pre-seed - $800K (raised 1 month ago)",
                "hiring_status": "Hiring 2x Deep Learning Engineers",
                "website_text": "Cognitive Nexus builds automation tools for executive staffing. We are hiring machine learning engineers with experience in embedding search, vector indexing and Agent systems."
            }
            memory_engine = MemoryEngine(db)
            memory_engine.store_long_term("COMPANY", "cognitivenexus.com", cached_company)
            
            # Seed contact
            cached_contact = {
                "name": "Oliver Thorn",
                "role": "Co-Founder & CTO",
                "email": "oliver@cognitivenexus.com",
                "linkedin": "linkedin.com/in/oliver-thorn-cog",
                "confidence": 0.98
            }
            memory_engine.store_long_term("CONTACT", "cognitivenexus.com", cached_contact)
            
    finally:
        db.close()


# --- Registry Endpoints ---

@app.get("/api/registry/agents", tags=["Registry"])
def get_agents():
    return agent_registry.list_agents()

@app.get("/api/registry/tools", tags=["Registry"])
def get_tools():
    return tool_registry.list_tools()


# --- Workflow Endpoints ---

@app.get("/api/workflows", response_model=List[schemas.WorkflowResponse], tags=["Workflows"])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(models.Workflow).all()

@app.post("/api/workflows", response_model=schemas.WorkflowResponse, tags=["Workflows"])
def create_workflow(payload: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    workflow = models.Workflow(
        name=payload.name,
        description=payload.description,
        config_json=json.dumps(payload.config.dict()),
        is_active=True
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@app.get("/api/workflows/{workflow_id}", response_model=schemas.WorkflowResponse, tags=["Workflows"])
def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@app.delete("/api/workflows/{workflow_id}", tags=["Workflows"])
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(wf)
    db.commit()
    return {"message": f"Workflow {workflow_id} deleted successfully."}


# --- Execution Endpoints ---

@app.get("/api/executions", response_model=List[schemas.ExecutionResponse], tags=["Executions"])
def list_executions(db: Session = Depends(get_db)):
    return db.query(models.Execution).order_by(models.Execution.created_at.desc()).all()

@app.get("/api/executions/{execution_id}", response_model=schemas.ExecutionResponse, tags=["Executions"])
def get_execution(execution_id: str, db: Session = Depends(get_db)):
    exec_record = db.query(models.Execution).filter(models.Execution.id == execution_id).first()
    if not exec_record:
        raise HTTPException(status_code=404, detail="Execution not found")
    return exec_record

@app.get("/api/executions/{execution_id}/logs", response_model=List[schemas.AuditLogResponse], tags=["Executions"])
def get_execution_logs(execution_id: str, db: Session = Depends(get_db)):
    return db.query(models.AuditLog).filter(models.AuditLog.execution_id == execution_id).order_by(models.AuditLog.timestamp.asc()).all()

@app.post("/api/workflows/{workflow_id}/execute", tags=["Executions"])
async def execute_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    config = wf.config
    objective = f"Run sales intelligence pipeline for targeting criteria: Industry: {config.get('industry')}, Location: {config.get('location')}."
    
    # 1. Planner Agent builds graph
    dag = planner_agent.plan_workflow(objective, config)
    
    # 2. Execution Engine schedules tasks
    executor = ExecutionEngine(db)
    execution_id = await executor.execute_workflow(workflow_id, dag, config)
    
    return {
        "execution_id": execution_id,
        "status": "RUNNING",
        "message": "Workflow execution scheduled successfully.",
        "dag": dag
    }

@app.post("/api/execute/adhoc", tags=["Executions"])
async def execute_adhoc(payload: Dict[str, Any], db: Session = Depends(get_db)):
    prompt = payload.get("prompt", "")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    # Standard fallback configuration parsed from ad-hoc text input
    config = {
        "industry": "IT Software",
        "location": "London",
        "min_size": 10,
        "target_technologies": ["React", "Python"],
        "target_personas": ["CTO", "Founder"],
        "formats": ["csv"]
    }
    
    # Add a custom workflow instance for the run
    wf = models.Workflow(
        name=f"Adhoc Funnel: {prompt[:30]}...",
        description=f"Generated via planner prompt: '{prompt}'",
        config_json=json.dumps(config),
        is_active=False
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)
    
    # Planner structures DAG
    dag = planner_agent.plan_workflow(prompt, config)
    
    # Execution Engine runs DAG
    executor = ExecutionEngine(db)
    execution_id = await executor.execute_workflow(wf.id, dag, config)
    
    return {
        "execution_id": execution_id,
        "workflow_id": wf.id,
        "status": "RUNNING",
        "message": "Adhoc planner query formulated and execution triggered.",
        "dag": dag
    }


# --- Human Approval Queue Endpoints ---

@app.get("/api/approvals", response_model=List[schemas.LeadResponse], tags=["Approvals"])
def list_pending_approvals(db: Session = Depends(get_db)):
    return db.query(models.Lead).filter(models.Lead.status == "PENDING_APPROVAL").order_by(models.Lead.confidence_score.desc()).all()

@app.get("/api/leads", response_model=List[schemas.LeadResponse], tags=["Leads"])
def list_all_leads(db: Session = Depends(get_db)):
    return db.query(models.Lead).all()

@app.post("/api/approvals/{lead_id}", response_model=schemas.LeadResponse, tags=["Approvals"])
def review_lead(lead_id: int, payload: schemas.LeadApprovalRequest, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead profile not found")
        
    if payload.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")
        
    lead.status = payload.status
    
    # If edits are provided, apply them
    if payload.edit_data:
        edit = payload.edit_data
        if edit.company_name is not None: lead.company_name = edit.company_name
        if edit.decision_maker_name is not None: lead.decision_maker_name = edit.decision_maker_name
        if edit.decision_maker_role is not None: lead.decision_maker_role = edit.decision_maker_role
        if edit.decision_maker_email is not None: lead.decision_maker_email = edit.decision_maker_email
        if edit.decision_maker_linkedin is not None: lead.decision_maker_linkedin = edit.decision_maker_linkedin
        if edit.confidence_score is not None: lead.confidence_score = edit.confidence_score
        if edit.recommendation_reason is not None: lead.recommendation_reason = edit.recommendation_reason
        
    db.commit()
    db.refresh(lead)
    
    # Audit log
    audit_log = models.AuditLog(
        execution_id=lead.execution_id,
        agent_name="HumanApproval",
        log_level="SUCCESS" if payload.status == "APPROVED" else "WARNING",
        message=f"Lead for '{lead.company_name}' ({lead.decision_maker_name}) was human-{payload.status.lower()}."
    )
    db.add(audit_log)
    db.commit()
    
    return lead


# --- Memory Explorer Endpoints ---

@app.get("/api/memory/long-term", response_model=List[schemas.MemoryEntryResponse], tags=["Memory"])
def list_memory_cache(entity_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.MemoryEntry)
    if entity_type:
        query = query.filter(models.MemoryEntry.entity_type == entity_type)
    return query.order_by(models.MemoryEntry.updated_at.desc()).all()

@app.get("/api/memory/semantic", tags=["Memory"])
def search_semantic_memory(q: str = Query(..., description="Semantic search terms"), db: Session = Depends(get_db)):
    engine = MemoryEngine(db)
    return engine.search_semantic(q)


# --- Analytics Endpoint ---

@app.get("/api/analytics", tags=["Analytics"])
def get_analytics(db: Session = Depends(get_db)):
    total_discovered = db.query(models.Lead).count()
    qualified = db.query(models.Lead).filter(models.Lead.status == "APPROVED").count()
    pending = db.query(models.Lead).filter(models.Lead.status == "PENDING_APPROVAL").count()
    rejected = db.query(models.Lead).filter(models.Lead.status == "REJECTED").count()
    
    # Calculate memory hits
    total_hits = 0
    executions = db.query(models.Execution).all()
    for ex in executions:
        total_hits += ex.memory_hits
        
    # Average confidence score of leads
    avg_confidence = 0.0
    leads = db.query(models.Lead).all()
    if leads:
        avg_confidence = round(sum(l.confidence_score for l in leads) / len(leads), 2)
        
    # Latencies
    avg_latency = 0.0
    completed_execs = db.query(models.Execution).filter(models.Execution.status != "RUNNING").all()
    if completed_execs:
        avg_latency = round(sum(ex.execution_time for ex in completed_execs) / len(completed_execs), 2)

    return {
        "discovered_companies": total_discovered,
        "qualified_leads": qualified,
        "pending_leads": pending,
        "rejected_leads": rejected,
        "memory_hits": total_hits,
        "avg_confidence": avg_confidence,
        "avg_execution_time": avg_latency,
        "agents_registered": len(agent_registry.list_agents()),
        "tools_registered": len(tool_registry.list_tools())
    }
