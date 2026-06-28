"""
VenturePilot AI — Sequential Workflow Runner

Chains all agents in order using the PlannerAgent's dynamic plan.
Flow: Planner → Discovery → Validation → per-company (plan-driven order)
"""

import logging
import threading
from app import memory as store_module
from app.memory import store
from app.agents.planner_agent import PlannerAgent
from app.agents.discovery_agent import DiscoveryAgent
from app.agents.validation_agent import ValidationAgent
from app.agents.company_profile_agent import CompanyProfileAgent
from app.agents.founder_profile_agent import FounderProfileAgent
from app.agents.github_agent import GitHubAgent
from app.agents.news_agent import NewsAgent
from app.agents.market_analysis_agent import MarketAnalysisAgent
from app.agents.scoring_agent import ScoringAgent
from app.agents.report_agent import ReportAgent

logger = logging.getLogger(__name__)

_agents = {
    "planner": PlannerAgent(),
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

BATCH_AGENTS = {"discovery", "validation"}


def _run_per_company_agent(company: dict, agent_name: str) -> dict:
    agent = _agents[agent_name]
    if agent_name == "company_profile":
        company.update(agent.run(company=company))
    elif agent_name == "founder_profile":
        company["founders"] = agent.run(company=company)
    elif agent_name == "github":
        company["github"] = agent.run(company=company)
    elif agent_name == "news":
        company["news"] = agent.run(company=company)
    elif agent_name == "market_analysis":
        company["market"] = agent.run(company=company)
    elif agent_name == "scoring":
        result = agent.run(profile=company)
        company["score"] = result.get("score", 0)
        company["tier"] = result.get("tier", "Low")
        company["score_breakdown"] = result.get("breakdown", {})
        company["rationale"] = result.get("rationale", "")
    elif agent_name == "report":
        company["report"] = agent.run(profile=company)
    return company


def run_workflow(job_id: str, icp: dict) -> None:
    try:
        store.update_job(job_id, status="running", current_step="planner")
        logger.info(f"Job {job_id}: starting workflow for ICP={icp}")

        plan = _agents["planner"].run(icp=icp)
        logger.info(f"Job {job_id}: planner produced plan={plan}")

        # Batch phase: discovery + validation
        if "discovery" in plan:
            store.update_job(job_id, current_step="discovery")
            companies = _agents["discovery"].run(icp=icp)
        else:
            companies = _agents["discovery"].run(icp=icp)

        if "validation" in plan:
            store.update_job(job_id, current_step="validation")
            companies = _agents["validation"].run(companies=companies)

        per_company_agents = [a for a in plan if a not in BATCH_AGENTS]

        enriched = []
        for i, company in enumerate(companies):
            store.update_job(job_id, current_step=f"enriching:{company['name']}")
            logger.info(f"Job {job_id}: enriching {company['name']}")

            for agent_name in per_company_agents:
                if agent_name not in _agents:
                    continue
                store.update_job(job_id, current_step=f"{agent_name}:{company['name']}")
                company = _run_per_company_agent(company, agent_name)

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
    thread = threading.Thread(
        target=run_workflow,
        args=(job_id, icp),
        daemon=True,
        name=f"workflow-{job_id[:8]}",
    )
    thread.start()
