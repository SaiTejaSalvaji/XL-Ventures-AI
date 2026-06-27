import sys
import os
import json
import asyncio

# Include backend and root path for import resolutions
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.planner.planner_agent import PlannerAgent
from backend.app.memory.vector_store import VectorStore
from backend.app.database.connection import SessionLocal, Base, engine
from backend.app.database.models import MemoryEntry

# Test 1: Vector Store & Cosine Similarity Lookup
def test_vector_store():
    print("\n--- Running Test 1: Vector Store & Cosine Similarity ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    store = VectorStore()
    
    try:
        # Pre-populate index
        store.add_text(db, "react_key", "Frontend engineer scaling React component modules with Tailwind and Vite.")
        store.add_text(db, "python_key", "Backend developer writing FastAPI API routers and SQLAlchemy DB models.")
        
        # Query similarity
        results = store.search_similar(db, "FastAPI backend python models", limit=2)
        
        assert len(results) > 0, "No results returned from semantic vector query."
        top_match, score = results[0]
        assert top_match.entity_key == "python_key", f"Incorrect top semantic result: {top_match.entity_key}"
        assert score > 0.0, "Cosine similarity score should be positive."
        print("[SUCCESS] Test 1: Semantic bi-gram bi-vector weights matched successfully.")
    finally:
        db.close()

# Test 2: DAG Graph Topological Ordering
def test_planner_dag():
    print("\n--- Running Test 2: Planner DAG Graph Compilation ---")
    planner = PlannerAgent()
    
    config = {
        "industry": "Recruitment",
        "location": "London",
        "min_size": 10,
        "target_technologies": ["React", "Python"],
        "target_personas": ["CTO"],
        "formats": ["csv"]
    }
    
    # Compile graph
    nodes = planner.plan_workflow("Find CTOs in London recruitment agencies", config)
    
    # Check node presence by task_id keys
    task_ids = [n["task_id"] for n in nodes]
    
    assert "discovery_task" in task_ids, "Discovery node missing in graph."
    assert "recommendation_task" in task_ids, "Recommendation summary node missing in graph."
    
    # Check dependencies sequence
    enrichment_node = next(n for n in nodes if n["task_id"] == "enrichment_task")
    assert "validation_task" in enrichment_node["dependencies"], "Enrichment node must depend on Validation."
    print("[SUCCESS] Test 2: Graph generated with correct topological dependencies.")

# Test 3: Long-Term Memory (LTM) Cache Lookup
def test_ltm_cache():
    print("\n--- Running Test 3: Long-Term Memory DB Cache Lookup ---")
    # Setup temporary SQLite schema for test execution
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Seed memory
        key = "exampletestcompany.com"
        db.query(MemoryEntry).filter(MemoryEntry.entity_key == key).delete()
        
        mock_data = {"name": "Test Company", "tech_stack": "React, FastAPI", "funding_status": "Seed"}
        entry = MemoryEntry(
            entity_type="COMPANY",
            entity_key=key,
            data_json=json.dumps(mock_data)
        )
        db.add(entry)
        db.commit()
        
        # Verify database retrieval
        retrieved = db.query(MemoryEntry).filter(
            MemoryEntry.entity_type == "COMPANY",
            MemoryEntry.entity_key == key
        ).first()
        
        assert retrieved is not None, "Failed to retrieve cache record."
        retrieved_data = json.loads(retrieved.data_json)
        assert retrieved_data["name"] == "Test Company", "Cached data attribute mismatch."
        print("[SUCCESS] Test 3: Database entity retrieved and validated correctly.")
    finally:
        db.close()

if __name__ == "__main__":
    print("==================================================")
    print("ProspectPilot AI Platform Verification Test Suite")
    print("==================================================")
    try:
        test_vector_store()
        test_planner_dag()
        test_ltm_cache()
        print("\n==================================================")
        print("ALL TESTS PASSED SUCCESSFULLY! Core engines online.")
        print("==================================================")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n[FAIL] Test Assertion Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error during verification: {e}")
        sys.exit(1)
