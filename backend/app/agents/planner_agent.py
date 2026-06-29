"""
planner_agent.py — Planner Agent
Uses Gemini to generate a dynamic agent execution plan from the ICP.
Falls back to a sensible default plan if Gemini is unavailable.
"""

from .base_agent import BaseAgent
from ..llm import ask_json

DEFAULT_PLAN = [
    "discovery", "validation", "company_profile",
    "founder_profile", "contact", "github", "news",
    "market_analysis", "scoring", "report",
]


class PlannerAgent(BaseAgent):
    name = "planner"
    description = "Uses Gemini to generate a dynamic agent execution plan from the ICP."

    def run(self, icp: dict | None = None, **kwargs) -> list[str]:
        self.log_start({"icp": icp})
        prompt = f"""
You are an AI research workflow planner for a venture capital firm.
Given this Ideal Customer Profile (ICP):
{icp}

Return a JSON array of agent names to execute IN ORDER from this list:
["discovery", "validation", "company_profile", "founder_profile", "contact",
 "github", "news", "market_analysis", "scoring", "report"]

Rules:
- Always include: discovery, validation, scoring, report
- Always include "contact" right after "founder_profile" to enrich decision-maker contacts.
- Include "github" only if stage is Seed/early-stage or if "github_activity" is in business_triggers.
- Include "news" if "funding" or "sentiment_positive" is in business_triggers, or for sentiment checks.
- Return ONLY the JSON array, no explanation.
"""
        result = ask_json(prompt, fallback=DEFAULT_PLAN)
        plan = result if isinstance(result, list) else DEFAULT_PLAN
        self.log_done(f"Plan: {plan}")
        return plan
