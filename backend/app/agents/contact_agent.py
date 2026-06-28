"""
contact_agent.py — Contact Discovery Agent
Generates plausible professional contact info (prototype).
No paid API (Hunter.io) needed for the demo.
"""

from .base_agent import BaseAgent
from ..tools.hunter_tool import generate_contact


class ContactAgent(BaseAgent):
    name = "contact"
    description = "Generates professional contact info for the prototype."

    def run(self, founder: dict | None = None, domain: str | None = None, **kwargs) -> dict:
        founder = founder or {}
        self.log_start({"founder": founder.get("name"), "domain": domain})

        name = founder.get("name", "Unknown")
        company_domain = domain or "company.com"
        contact = generate_contact(name, company_domain)

        self.log_done(f"Contact for {name}: {contact['email']}")
        return contact
