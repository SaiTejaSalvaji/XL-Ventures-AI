import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from backend.app.database.models import MemoryEntry, Execution, AuditLog
from backend.app.memory.vector_store import vector_store

class MemoryEngine:
    def __init__(self, db: Session, execution_id: Optional[str] = None):
        self.db = db
        self.execution_id = execution_id
        self.working_memory: Dict[str, Any] = {}
        self.short_term_memory: Dict[str, Any] = {}

    # --- Working Memory ---
    # Transient execution-level variables
    def set_working(self, key: str, value: Any):
        self.working_memory[key] = value

    def get_working(self, key: str, default: Any = None) -> Any:
        return self.working_memory.get(key, default)

    # --- Short-Term Memory ---
    # Scoped to the current workflow execution run
    def set_short_term(self, key: str, value: Any):
        self.short_term_memory[key] = value
        # Sync with execution record in DB if execution_id is set
        if self.execution_id:
            exec_record = self.db.query(Execution).filter(Execution.id == self.execution_id).first()
            if exec_record:
                curr_summary = exec_record.result_summary
                curr_summary[key] = value
                exec_record.result_summary = curr_summary
                self.db.commit()

    def get_short_term(self, key: str, default: Any = None) -> Any:
        if self.execution_id:
            exec_record = self.db.query(Execution).filter(Execution.id == self.execution_id).first()
            if exec_record:
                return exec_record.result_summary.get(key, default)
        return self.short_term_memory.get(key, default)

    # --- Long-Term Memory ---
    # Persistent caching of companies or contacts to prevent duplicate API spend
    def check_long_term(self, entity_type: str, entity_key: str) -> Optional[Dict[str, Any]]:
        entity_key = entity_key.lower().strip()
        entry = self.db.query(MemoryEntry).filter(
            MemoryEntry.entity_type == entity_type,
            MemoryEntry.entity_key == entity_key
        ).first()
        
        if entry:
            # Increment memory hit in execution stats
            if self.execution_id:
                exec_record = self.db.query(Execution).filter(Execution.id == self.execution_id).first()
                if exec_record:
                    exec_record.memory_hits += 1
                    self.db.commit()
                
                # Write an audit log for the hit
                log_entry = AuditLog(
                    execution_id=self.execution_id,
                    agent_name="MemoryEngine",
                    log_level="SUCCESS",
                    message=f"Memory Hit! Retreived cached {entity_type} for key: '{entity_key}'. Skipping live API call.",
                    data_payload={"entity_key": entity_key, "entity_type": entity_type}
                )
                self.db.add(log_entry)
                self.db.commit()
                
            return entry.data
        return None

    def store_long_term(self, entity_type: str, entity_key: str, data: Dict[str, Any]):
        entity_key = entity_key.lower().strip()
        entry = self.db.query(MemoryEntry).filter(
            MemoryEntry.entity_type == entity_type,
            MemoryEntry.entity_key == entity_key
        ).first()

        if entry:
            entry.data = data
        else:
            entry = MemoryEntry(
                entity_type=entity_type,
                entity_key=entity_key,
                data=data
            )
            self.db.add(entry)
        self.db.commit()
        
        # Add to Semantic Memory as well
        text_for_embedding = f"Type: {entity_type}. Key: {entity_key}. Content: {json.dumps(data)}"
        vector_store.add_text(self.db, f"{entity_type}:{entity_key}", text_for_embedding)

    # --- Semantic Memory ---
    # Search similar concepts
    def search_semantic(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        results = vector_store.search_similar(self.db, query, limit=limit)
        return [
            {"key": item[0].entity_key, "content": item[0].text_content, "score": item[1]}
            for item in results
        ]

    # --- Knowledge Memory ---
    # Business guidelines, qualification profiles, etc.
    def get_knowledge_rule(self, rule_name: str, default: Any = None) -> Any:
        # Load from active workflow config
        if self.execution_id:
            exec_record = self.db.query(Execution).filter(Execution.id == self.execution_id).first()
            if exec_record and exec_record.workflow:
                return exec_record.workflow.config.get(rule_name, default)
        return default
