"""
VenturePilot AI — Sequential Workflow Runner

Chains all agents in order for the prototype.
No LangGraph required — simple Python loop.

Flow:
  Discovery → Validation → [CompanyProfile + GitHub + News + Market] → Scoring → Report
"""

import logging
import threading
from src import memory as store_module
from src.memory import store
from src.agents.discovery_agent import DiscoveryAgent
from src.agents.validation_agent import ValidationAgent
from src.agents.company_profile_agent import CompanyProfileAgent
from src.agents.founder_profile_agent import FounderProfileAgent
from src.agents.github_agent import GitHubAgent
from src.agents.news_agent import NewsAgent
from src.agents.market_analysis_agent import MarketAnalysisAgent
from src.agents.scoring_agent import ScoringAgent
from src.agents.report_agent import ReportAgent

logger = logging.getLogger(__name__)

# Agent instances (reused across calls)
_agents = {
    "discovery": DiscoveryAgent(),
    "validation": ValidationAgent(),
    "company_profile": CompanyProfileAgent(),
    "founder_profile": FounderProfileAgent(),
    "github": GitHubAgent(),
    "news": NewsAgent(),
    "market_analysis": MarketAnalysisAgent(),
    "scoring": ScoringAgent(),
    "report": ReportAgent(),
}


def run_workflow(job_id: str, icp: dict) -> None:
    """
    Run the full agent pipeline for a given ICP.
    Designed to be called in a background thread.

    Updates the job store at each step so the frontend can poll progress.
    """
    try:
        store.update_job(job_id, status="running", current_step="discovery")
        logger.info(f"Job {job_id}: starting workflow for ICP={icp}")

        # Step 1 — Discovery
        companies = _agents["discovery"].run(icp=icp)
        logger.info(f"Job {job_id}: discovered {len(companies)} companies")
        store.update_job(job_id, current_step="validation")

        # Step 2 — Validation
        companies = _agents["validation"].run(companies=companies)
        logger.info(f"Job {job_id}: {len(companies)} companies passed validation")

        # Step 3 — Enrich each company
        enriched = []
        for i, company in enumerate(companies):
            step = f"enriching:{company['name']}"
            store.update_job(job_id, current_step=step)
            logger.info(f"Job {job_id}: enriching {company['name']}")

            # Profile + GitHub + News + Market (sequential for simplicity)
            company.update(_agents["company_profile"].run(company=company))
            company["founders"] = _agents["founder_profile"].run(company=company)
            company["github"] = _agents["github"].run(company=company)
            company["news"] = _agents["news"].run(company=company)
            company["market"] = _agents["market_analysis"].run(company=company)

            # Score
            store.update_job(job_id, current_step=f"scoring:{company['name']}")
            scoring_result = _agents["scoring"].run(profile=company)
            company["score"] = scoring_result.get("score", 0)
            company["tier"] = scoring_result.get("tier", "Low")
            company["score_breakdown"] = scoring_result.get("breakdown", {})
            company["rationale"] = scoring_result.get("rationale", "")

            # Report
            store.update_job(job_id, current_step=f"report:{company['name']}")
            company["report"] = _agents["report"].run(profile=company)

            store.save_company(company)
            enriched.append(company)

        store.update_job(
            job_id,
            status="done",
            current_step=None,
            result=[c["name"] for c in enriched],
        )
        logger.info(f"Job {job_id}: workflow complete — {len(enriched)} companies processed")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        store.update_job(job_id, status="error", current_step=str(e))


def start_workflow_async(job_id: str, icp: dict) -> None:
    """Launch the workflow in a background thread (non-blocking)."""
    thread = threading.Thread(
        target=run_workflow,
        args=(job_id, icp),
        daemon=True,
        name=f"workflow-{job_id[:8]}",
    )
    thread.start()
