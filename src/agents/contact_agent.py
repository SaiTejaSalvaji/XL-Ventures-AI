"""
contact_agent.py — Contact Discovery Agent
Generates plausible professional contact info using Gemini (prototype).
No paid API (Hunter.io) needed for the demo.
"""

from src.agents.base_agent import BaseAgent
from src.llm import ask_json


class ContactAgent(BaseAgent):
    name = "contact"
    description = "Generates professional contact info using Gemini for the prototype."

    def run(self, founder: dict | None = None, domain: str | None = None, **kwargs) -> dict:
        founder = founder or {}
        self.log_start({"founder": founder.get("name"), "domain": domain})

        name = founder.get("name", "Unknown")
        company_domain = domain or "company.com"

        # Generate a plausible work email format
        parts = name.lower().split()
        if len(parts) >= 2:
            email_guess = f"{parts[0]}.{parts[-1]}@{company_domain}"
        else:
            email_guess = f"{parts[0]}@{company_domain}" if parts else f"contact@{company_domain}"

        contact = {
            "email": email_guess,
            "confidence_score": 65,  # Placeholder confidence
            "linkedin_url": founder.get("linkedin_url", f"https://linkedin.com/in/{name.lower().replace(' ', '-')}"),
            "phone": None,
            "source": "generated",
        }
        self.log_done(f"Contact for {name}: {email_guess}")
        return contact
