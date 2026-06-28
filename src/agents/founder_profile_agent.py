"""
founder_profile_agent.py — Founder Profile Agent
Uses Gemini's knowledge to generate realistic founder profiles for demo.
Optionally enriched via Google CSE search.
"""

import os
import requests
from src.agents.base_agent import BaseAgent
from src.llm import ask_json


class FounderProfileAgent(BaseAgent):
    name = "founder_profile"
    description = "Finds founder info via Google CSE and summarizes with Gemini."

    def run(self, company: dict | None = None, **kwargs) -> list[dict]:
        company = company or {}
        self.log_start({"company": company.get("name")})

        founders = self._gemini_founders(company)
        self.log_done(f"Found {len(founders)} founders for {company.get('name')}")
        return founders

    def _gemini_founders(self, company: dict) -> list[dict]:
        name = company.get("name", "")
        industry = company.get("industry", "technology")
        prompt = f"""
You are a startup research assistant. For the company "{name}" in the {industry} space (India),
generate realistic founder profiles based on your knowledge. If you don't know the actual founders,
create plausible profiles for a typical Indian {industry} startup.

Return ONLY a JSON array with 1-3 founders, each having these keys:
[
  {{
    "name": "Full Name",
    "title": "CEO | CTO | COO",
    "background": "2-sentence professional background",
    "education": "University, Degree",
    "linkedin_url": "https://linkedin.com/in/placeholder",
    "past_companies": ["Company1", "Company2"]
  }}
]
"""
        result = ask_json(prompt, fallback=[
            {
                "name": f"{name} Founder",
                "title": "CEO & Co-founder",
                "background": f"Serial entrepreneur with 10+ years in {industry}.",
                "education": "IIT Delhi, B.Tech Computer Science",
                "linkedin_url": "https://linkedin.com/in/placeholder",
                "past_companies": ["Previous Startup", "Big Tech Co"],
            }
        ])
        return result if isinstance(result, list) else [result]
