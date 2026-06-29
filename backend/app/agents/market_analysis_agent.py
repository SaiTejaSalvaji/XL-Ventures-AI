"""
market_analysis_agent.py — Market Analysis Agent
Uses Gemini's built-in knowledge to generate competitive landscape and market data.
No external API needed — Gemini knows market data for most industries.
"""

from .base_agent import BaseAgent
from ..llm import ask_json


class MarketAnalysisAgent(BaseAgent):
    name = "market_analysis"
    description = "Uses Gemini to generate competitive landscape, TAM, and market trends."

    def run(self, company: dict | None = None, **kwargs) -> dict:
        company = company or {}
        self.log_start({"company": company.get("name")})

        name = company.get("name", "")
        industry = company.get("industry", "technology")
        location = company.get("location", "India")

        prompt = f"""
You are a market research analyst. Analyze the competitive landscape for:
Company: {name}
Industry: {industry}
Location: {location}

Return ONLY valid JSON:
{{
  "competitors": [
    {{"name": "Company Name", "url": "https://...", "differentiator": "what makes them different"}},
    {{"name": "Company Name 2", "url": "https://...", "differentiator": "..."}},
    {{"name": "Company Name 3", "url": "https://...", "differentiator": "..."}}
  ],
  "tam_estimate": "e.g. $5B by 2027",
  "market_growth_rate": "e.g. 35% CAGR",
  "key_trends": ["trend 1", "trend 2", "trend 3"],
  "market_stage": "emerging | growing | mature"
}}
"""
        result = ask_json(
            prompt,
            fallback={
                "competitors": [
                    {
                        "name": f"{industry} Alpha",
                        "url": "https://example.com",
                        "differentiator": "Market leader",
                    },
                    {
                        "name": f"{industry} Beta",
                        "url": "https://example.com",
                        "differentiator": "Niche focus",
                    },
                ],
                "tam_estimate": "$2.5B by 2027",
                "market_growth_rate": "28% CAGR",
                "key_trends": [
                    f"AI integration in {industry}",
                    "Workflow automation",
                    "Cloud scalability",
                ],
                "market_stage": "growing",
            },
        )
        self.log_done(f"Market analysis complete for {name}")
        return result
