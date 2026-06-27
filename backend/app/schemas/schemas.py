from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Workflow config nested schema
class WorkflowConfigSchema(BaseModel):
    industry: str = Field(default="IT Staffing & Recruitment")
    location: str = Field(default="London, United Kingdom")
    min_size: int = Field(default=10)
    target_technologies: List[str] = Field(default=["React", "Python", "FastAPI"])
    target_personas: List[str] = Field(default=["CTO", "VP of Engineering", "Head of Talent Acquisition"])
    formats: List[str] = Field(default=["csv", "json"])

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    config: WorkflowConfigSchema

class WorkflowResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    config_json: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Lead validation/edit schema
class LeadEditSchema(BaseModel):
    company_name: Optional[str] = None
    decision_maker_name: Optional[str] = None
    decision_maker_role: Optional[str] = None
    decision_maker_email: Optional[str] = None
    decision_maker_linkedin: Optional[str] = None
    confidence_score: Optional[float] = None
    recommendation_reason: Optional[str] = None

class LeadApprovalRequest(BaseModel):
    status: str = Field(description="APPROVED or REJECTED")
    edit_data: Optional[LeadEditSchema] = None

class LeadResponse(BaseModel):
    id: int
    execution_id: Optional[str]
    company_name: str
    domain: str
    industry: Optional[str]
    company_size: Optional[str]
    location: Optional[str]
    tech_stack: Optional[str]
    funding_status: Optional[str]
    hiring_status: Optional[str]
    decision_maker_name: Optional[str]
    decision_maker_role: Optional[str]
    decision_maker_email: Optional[str]
    decision_maker_linkedin: Optional[str]
    confidence_score: float
    recommendation_reason: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Execution response schemas
class ExecutionResponse(BaseModel):
    id: str
    workflow_id: Optional[int]
    status: str
    current_step: Optional[str]
    step_status_json: str
    result_summary_json: str
    memory_hits: int
    execution_time: float
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

# Audit log schemas
class AuditLogResponse(BaseModel):
    id: int
    execution_id: Optional[str]
    agent_name: Optional[str]
    log_level: str
    message: str
    data_payload_json: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Memory entry schemas
class MemoryEntryResponse(BaseModel):
    id: int
    entity_type: str
    entity_key: str
    data_json: str
    updated_at: datetime

    class Config:
        from_attributes = True
