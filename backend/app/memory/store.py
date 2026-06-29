"""
VenturePilot AI — In-Memory Store

Simple dict-based storage for the prototype.
No database setup required — everything lives in memory during the server session.

For a production system, replace with SQLAlchemy + PostgreSQL.
"""

import uuid
from datetime import datetime, UTC

# Global in-memory store
_store: dict = {
    "companies": {},  # name → company dict
    "reports": {},  # name → markdown string
    "decisions": {},  # company_id → {"decision": ..., "notes": ...}
    "jobs": {},  # job_id → {"status": ..., "icp": ..., "result": ...}
}


# ── Company CRUD ─────────────────────────────────────────────────────────────


def save_company(company: dict) -> None:
    """Save or update a company by name."""
    company.setdefault("id", str(uuid.uuid4()))
    company.setdefault("created_at", datetime.now(UTC).isoformat())
    _store["companies"][company["name"]] = company


def get_company(name: str) -> dict | None:
    return _store["companies"].get(name)


def get_company_by_id(company_id: str) -> dict | None:
    for c in _store["companies"].values():
        if c.get("id") == company_id:
            return c
    return None


def get_all_companies() -> list[dict]:
    return list(_store["companies"].values())


def clear_companies() -> None:
    _store["companies"].clear()


def clear_all() -> None:
    _store["companies"].clear()
    _store["reports"].clear()
    _store["decisions"].clear()
    _store["jobs"].clear()


# ── Reports ───────────────────────────────────────────────────────────────────


def save_report(company_name: str, report: str) -> None:
    _store["reports"][company_name] = report


def get_report(company_name: str) -> str | None:
    return _store["reports"].get(company_name)


# ── HITL Decisions ───────────────────────────────────────────────────────────


def save_decision(company_id: str, decision: str, notes: str = "") -> None:
    _store["decisions"][company_id] = {
        "decision": decision,
        "notes": notes,
        "recorded_at": datetime.utcnow().isoformat(),
    }


def get_decision(company_id: str) -> dict | None:
    return _store["decisions"].get(company_id)


# ── Jobs (async workflow tracking) ───────────────────────────────────────────


def create_job(icp: dict) -> str:
    job_id = str(uuid.uuid4())
    _store["jobs"][job_id] = {
        "status": "queued",
        "icp": icp,
        "result": [],
        "current_step": None,
        "created_at": datetime.now(UTC).isoformat(),
    }
    return job_id


def update_job(job_id: str, **kwargs) -> None:
    if job_id in _store["jobs"]:
        _store["jobs"][job_id].update(kwargs)


def get_job(job_id: str) -> dict | None:
    return _store["jobs"].get(job_id)
