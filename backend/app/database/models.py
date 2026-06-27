import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspaces = relationship("Workspace", back_populates="organization", cascade="all, delete-orphan")

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="workspaces")
    users = relationship("User", back_populates="workspace")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="member") # admin, member
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="users")

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    # config stores: target industry, sizes, personas, keywords, API configs, settings, etc.
    config_json = Column(Text, default="{}")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def config(self):
        try:
            return json.loads(self.config_json)
        except Exception:
            return {}

    @config.setter
    def config(self, value):
        self.config_json = json.dumps(value)

    executions = relationship("Execution", back_populates="workflow", cascade="all, delete-orphan")

class Execution(Base):
    __tablename__ = "executions"
    id = Column(String, primary_key=True, index=True) # UUID string
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    status = Column(String, default="PENDING") # PENDING, RUNNING, COMPLETED, FAILED, WAITING_APPROVAL
    current_step = Column(String, nullable=True)
    step_status_json = Column(Text, default="{}") # step_name: {"status": "PENDING", "latency": 0.0, "memory_hit": bool}
    result_summary_json = Column(Text, default="{}")
    memory_hits = Column(Integer, default=0)
    execution_time = Column(Float, default=0.0) # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    workflow = relationship("Workflow", back_populates="executions")
    leads = relationship("Lead", back_populates="execution", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="execution", cascade="all, delete-orphan")

    @property
    def step_status(self):
        try:
            return json.loads(self.step_status_json)
        except Exception:
            return {}

    @step_status.setter
    def step_status(self, value):
        self.step_status_json = json.dumps(value)

    @property
    def result_summary(self):
        try:
            return json.loads(self.result_summary_json)
        except Exception:
            return {}

    @result_summary.setter
    def result_summary(self, value):
        self.result_summary_json = json.dumps(value)

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String, ForeignKey("executions.id"), nullable=True)
    company_name = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    location = Column(String, nullable=True)
    tech_stack = Column(Text, nullable=True) # comma separated or JSON array
    funding_status = Column(Text, nullable=True) # e.g. "Series A - $5M"
    hiring_status = Column(Text, nullable=True) # e.g. "Hiring 3 React devs"
    decision_maker_name = Column(String, nullable=True)
    decision_maker_role = Column(String, nullable=True)
    decision_maker_email = Column(String, nullable=True)
    decision_maker_linkedin = Column(String, nullable=True)
    confidence_score = Column(Float, default=0.0)
    evidence_json = Column(Text, default="{}") # detailed proof from agents
    recommendation_reason = Column(Text, nullable=True)
    status = Column(String, default="PENDING_APPROVAL") # PENDING_APPROVAL, APPROVED, REJECTED, EXPORTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    execution = relationship("Execution", back_populates="leads")

    @property
    def evidence(self):
        try:
            return json.loads(self.evidence_json)
        except Exception:
            return {}

    @evidence.setter
    def evidence(self, value):
        self.evidence_json = json.dumps(value)

class MemoryEntry(Base):
    __tablename__ = "memory_entries"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # COMPANY, CONTACT, CRITERIA
    entity_key = Column(String, nullable=False, unique=True, index=True) # e.g., company domain, or full_name
    data_json = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def data(self):
        try:
            return json.loads(self.data_json)
        except Exception:
            return {}

    @data.setter
    def data(self, value):
        self.data_json = json.dumps(value)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String, ForeignKey("executions.id"), nullable=True)
    agent_name = Column(String, nullable=True)
    log_level = Column(String, default="INFO") # INFO, SUCCESS, WARNING, ERROR
    message = Column(Text, nullable=False)
    data_payload_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow)

    execution = relationship("Execution", back_populates="audit_logs")

    @property
    def data_payload(self):
        try:
            return json.loads(self.data_payload_json)
        except Exception:
            return {}

    @data_payload.setter
    def data_payload(self, value):
        self.data_payload_json = json.dumps(value)

class SemanticMemory(Base):
    __tablename__ = "semantic_memories"
    id = Column(Integer, primary_key=True, index=True)
    entity_key = Column(String, nullable=False, index=True)
    text_content = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=False) # JSON float array
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def embedding(self):
        try:
            return json.loads(self.embedding_json)
        except Exception:
            return []

    @embedding.setter
    def embedding(self, value):
        self.embedding_json = json.dumps(value)
