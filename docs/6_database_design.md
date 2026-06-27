# 6. Database Design & Relational Schema

ProspectPilot AI uses a relational database schema designed to support multi-tenant workspaces, audit tracking, cache persistence, and lead validation states. The platform uses **SQLAlchemy ORM** to enable compatibility across SQLite (local development) and PostgreSQL (production).

---

## 1. Relational Schema Diagram (Entity Relationship)

```
  +-------------------+
  |   Organizations   |
  +-------------------+
  | id (PK)           |
  | name              |
  +---------+---------+
            | 1
            |
            | *
  +---------v---------+
  |    Workspaces     |
  +-------------------+
  | id (PK)           |
  | name              |
  | organization_id   |<---+
  +---------+---------+    | 1
            |              |
            | 1            | *
            | *            |
  +---------v---------+    |
  |       Users       |----+
  +-------------------+
  | id (PK)           |
  | email             |
  | hashed_password   |
  | workspace_id (FK) |
  +-------------------+

  +-------------------+          +-------------------+
  |     Workflows     | 1      * |    Executions     |
  +-------------------+----------+-------------------+
  | id (PK)           |          | id (PK) [UUID]    |
  | name              |          | workflow_id (FK)  |
  | config_json       |          | status            |
  | is_active         |          | current_step      |
  +-------------------+          | step_status_json  |
                                 | execution_time    |
                                 +---+-----------+---+
                                     | 1         | 1
                                     |           |
                                     | *         | *
                               +-----v---+   +---v-----+
                               |  Leads  |   |AuditLogs|
                               +---------+   +---------+
                               | id (PK) |   | id (PK) |
                               | company |   | message |
                               | email   |   | payload |
                               | status  |   +---------+
                               +---------+
```

---

## 2. Table Specifications

### 1. Workflows (`workflows`)
Defines the configured intelligence parameters:
- `config_json`: Stores the targeting profiles, technology targets, and persona keywords.

### 2. Executions (`executions`)
Tracks DAG run status:
- `status`: PENDING, RUNNING, COMPLETED, FAILED, WAITING_APPROVAL.
- `step_status_json`: Tracks progress for each step in the DAG, storing latency, start/end timestamps, and error messages.
- `result_summary_json`: Shared short-term memory block containing intermediate run details.

### 3. Leads (`leads`)
Holds prospects awaiting human verification:
- `status`: PENDING_APPROVAL, APPROVED, REJECTED, EXPORTED.
- `confidence_score`: Float between 0.0 and 1.0 indicating fit rating.
- `evidence_json`: Detailed facts gathered by agents (e.g. scraped snippets) supporting the score.

### 4. Memory Entries (`memory_entries`)
Long-Term memory storage:
- `entity_type`: COMPANY or CONTACT.
- `entity_key`: Unique domain address or email.
- `data_json`: Cached attributes.

### 5. Audit Logs (`audit_logs`)
Maintains execution logs:
- `log_level`: INFO, SUCCESS, WARNING, ERROR.
- `data_payload_json`: Input/output state for each agent action.

---

## 3. Seed Configurations & Database Initialization

Upon starting up the FastAPI application, the DB engine performs a bootstrap check:
1. **Schema Generation**: `Base.metadata.create_all(bind=engine)` creates tables if they do not exist.
2. **Default Sourcing Funnel**: Seeds a default "AI Engineer Sourcing Funnel" workflow configured to target London-based companies using React, Python, and FastAPI.
3. **LTM Pre-seeding**: Seeds a mock company profile ("Cognitive Nexus") and its CTO contact into `memory_entries` to demonstrate a cache hit on the first test run.
