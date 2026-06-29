"""
VenturePilot AI — FastAPI Application
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .memory import store
from .workflow.runner import start_workflow_async

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VenturePilot AI",
    description="Agentic AI platform for B2B opportunity discovery — powered by Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ───────────────────────────────────────────────────


class ICPRequest(BaseModel):
    industry: str = "AI Healthcare"
    stage: str = "Seed"
    location: str = "India"
    tech_keywords: list[str] = ["machine learning", "AI"]
    target_personas: list[str] = ["CEO", "CTO", "Founder"]
    business_triggers: list[str] = ["funding", "github_activity"]
    min_qualification_score: int = 70


class ApprovalRequest(BaseModel):
    decision: str  # "approve" | "reject" | "more_info"
    notes: str = ""


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "service": "VenturePilot AI", "version": "1.0.0"}


@app.post("/analyze")
async def analyze(icp: ICPRequest):
    """
    Trigger the full agent workflow for a given ICP.
    Returns a job_id immediately; poll /results/{job_id} for updates.
    """
    icp_dict = icp.model_dump()
    job_id = store.create_job(icp_dict)
    start_workflow_async(job_id, icp_dict)
    return {"job_id": job_id, "status": "running"}


@app.get("/results/{job_id}")
async def get_results(job_id: str):
    """
    Poll the status of a running analysis job.
    Returns status + list of enriched company objects when done.
    """
    job = store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    companies = []
    if job["status"] == "done":
        companies = [
            store.get_company(name)
            for name in job.get("result", [])
            if store.get_company(name) is not None
        ]

    return {
        "job_id": job_id,
        "status": job["status"],
        "current_step": job.get("current_step"),
        "companies": companies,
    }


@app.get("/companies")
async def list_companies():
    """Return all discovered + enriched companies."""
    companies = store.get_all_companies()
    # Sort by score descending
    companies.sort(key=lambda c: c.get("score", 0), reverse=True)
    return {"companies": companies, "total": len(companies)}


@app.post("/approve/{company_id}")
async def approve_company(company_id: str, body: ApprovalRequest):
    """Record a Human-in-the-Loop decision for a company."""
    company = store.get_company_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    store.save_decision(company_id, body.decision, body.notes)
    return {
        "company_id": company_id,
        "company_name": company.get("name"),
        "decision": body.decision,
        "status": "recorded",
    }


@app.get("/company/{company_id}/report")
async def get_report(company_id: str):
    """Return the Gemini-generated report for a specific company."""
    company = store.get_company_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {
        "company_id": company_id,
        "company_name": company.get("name"),
        "report": company.get("report", "Report not yet generated."),
    }
