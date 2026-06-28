"""
company_profile_agent.py — Company Profile Agent
Scrapes company homepage and uses Gemini to extract structured profile info.
"""

from .base_agent import BaseAgent
from ..llm import ask_json
from ..tools.scraping_tool import scrape_website


class CompanyProfileAgent(BaseAgent):
    name = "company_profile"
    description = "Scrapes company homepage and uses Gemini to build a structured profile."

    def run(self, company: dict | None = None, **kwargs) -> dict:
        company = company or {}
        self.log_start({"company": company.get("name")})

        raw_text = self._scrape(company.get("url", ""))
        profile = self._gemini_extract(company, raw_text)

        company.update(profile)
        self.log_done(f"Profile built for {company.get('name')}")
        return company

    def _scrape(self, url: str) -> str:
        return scrape_website(url)

    def _gemini_extract(self, company: dict, raw_text: str) -> dict:
        name = company.get("name", "")
        existing_desc = company.get("description", "")
        context = raw_text or existing_desc or f"{name} is a technology company."

        prompt = f"""
Analyze this company information and return a JSON object:

Company: {name}
Text: {context[:1000]}

Return ONLY valid JSON with these exact keys:
{{
  "tagline": "one-line company description",
  "product": "what the company builds/sells",
  "target_customers": "who they sell to",
  "tech_stack": ["list", "of", "technologies"],
  "employee_estimate": "1-10 | 11-50 | 51-200 | 201-500 | 500+",
  "founded_year": "year or null",
  "business_model": "B2B | B2C | B2B2C | marketplace"
}}
"""
        result = ask_json(prompt, fallback={
            "tagline": existing_desc,
            "product": "Technology solution",
            "target_customers": "Enterprises",
            "tech_stack": ["AI", "Machine Learning"],
            "employee_estimate": "11-50",
            "founded_year": None,
            "business_model": "B2B",
        })
        return result
