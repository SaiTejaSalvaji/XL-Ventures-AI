"""
VenturePilot AI — Sequential Workflow Runner

Chains all agents in order using the PlannerAgent's dynamic plan.
Flow: Planner → Discovery → Validation → per-company (plan-driven order)
"""

import logging
import threading
import importlib
import pkgutil
import app.agents
from app.agents.base_agent import AGENT_REGISTRY
from app.memory import store

logger = logging.getLogger(__name__)

# Dynamically discover and import all agent modules to trigger auto-registration
for _, module_name, _ in pkgutil.walk_packages(app.agents.__path__, app.agents.__name__ + "."):
    try:
        importlib.import_module(module_name)
    except Exception as e:
        logger.error(f"Failed to dynamically auto-discover agent {module_name}: {e}")

# Automatically instantiate all registered agents (Extensible registry / plugin pattern)
_agents = {name: cls() for name, cls in AGENT_REGISTRY.items()}

BATCH_AGENTS = {"discovery", "validation"}


def _run_per_company_agent(company: dict, agent_name: str, icp: dict | None = None) -> dict:
    agent = _agents[agent_name]
    if agent_name == "company_profile":
        company.update(agent.run(company=company, icp=icp))
    elif agent_name == "founder_profile":
        company["founders"] = agent.run(company=company, icp=icp)
    elif agent_name == "contact":
        domain = (
            company.get("url", "").replace("https://", "").replace("http://", "").split("/")[0]
            or "company.com"
        )
        for founder in company.get("founders", []):
            contact_info = agent.run(founder=founder, domain=domain, icp=icp)
            founder.update(contact_info)
    elif agent_name == "github":
        company["github"] = agent.run(company=company, icp=icp)
    elif agent_name == "news":
        company["news"] = agent.run(company=company, icp=icp)
    elif agent_name == "market_analysis":
        company["market"] = agent.run(company=company, icp=icp)
    elif agent_name == "scoring":
        result = agent.run(profile=company, icp=icp)
        company["score"] = result.get("score", 0)
        company["tier"] = result.get("tier", "Low")
        company["score_breakdown"] = result.get("breakdown", {})
        company["rationale"] = result.get("rationale", "")
    elif agent_name == "report":
        company["report"] = agent.run(profile=company, icp=icp)
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

            # Shared Memory: check if we have this company already fully analyzed to avoid duplicate work
            existing = store.get_company(company["name"])
            if existing and existing.get("report") and existing.get("score") is not None:
                logger.info(
                    f"Avoid Duplicate Work: {company['name']} is already fully enriched. Skipping agents."
                )
                store.save_company(existing)  # Ensure it is recorded in the store
                enriched.append(existing)
                continue

            for agent_name in per_company_agents:
                if agent_name not in _agents:
                    continue
                store.update_job(job_id, current_step=f"{agent_name}:{company['name']}")
                company = _run_per_company_agent(company, agent_name, icp)

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
