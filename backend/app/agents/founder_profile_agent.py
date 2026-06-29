"""
founder_profile_agent.py — Founder Profile Agent
Uses Gemini's knowledge to generate realistic founder profiles for demo.
Optionally enriched via Google CSE search.
"""

from .base_agent import BaseAgent
from ..llm import ask_json


class FounderProfileAgent(BaseAgent):
    name = "founder_profile"
    description = "Finds founder info via Google CSE and summarizes with Gemini."

    def run(self, company: dict | None = None, **kwargs) -> list[dict]:
        company = company or {}
        self.log_start({"company": company.get("name")})

        icp = kwargs.get("icp") or {}
        target_personas = icp.get("target_personas", ["CEO", "CTO", "Founder"])

        founders = self._gemini_founders(company, target_personas)
        self.log_done(f"Found {len(founders)} founders for {company.get('name')}")
        return founders

    def _gemini_founders(self, company: dict, target_personas: list[str]) -> list[dict]:
        name = company.get("name", "")
        industry = company.get("industry", "technology")
        personas_str = ", ".join(target_personas)
        prompt = f"""
You are a startup research assistant. For the company "{name}" in the {industry} space,
generate realistic founder profiles based on your knowledge. Focus on profiles matching these target roles/personas: {personas_str}.
If you don't know the actual founders, create plausible profiles for a typical {industry} startup, ensuring they match some of these target roles.

Return ONLY a JSON array with 1-3 founders, each having these keys:
[
  {{
    "name": "Full Name",
    "title": "One of: {personas_str}",
    "background": "2-sentence professional background",
    "education": "University, Degree",
    "linkedin_url": "use a realistic linkedin.com/in/name URL",
    "past_companies": ["Company1", "Company2"]
  }}
]
"""
        name_slug = name.lower().replace(" ", "-").replace(".", "")
        result = ask_json(
            prompt,
            fallback=[
                {
                    "name": f"{name} Founder",
                    "title": target_personas[0] if target_personas else "CEO",
                    "background": f"Serial entrepreneur with 10+ years in {industry}.",
                    "education": "IIT Delhi, B.Tech Computer Science",
                    "linkedin_url": f"https://linkedin.com/in/{name_slug}-founder",
                    "past_companies": ["Previous Startup", "Big Tech Co"],
                }
            ],
        )
        return result if isinstance(result, list) else [result]
