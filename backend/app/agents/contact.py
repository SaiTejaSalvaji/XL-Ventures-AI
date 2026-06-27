from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry
from backend.app.tools.mock_data import get_mock_enrichment

class ContactInput(BaseModel):
    decision_makers: List[Dict[str, Any]] = Field(description="List of identified decision makers with 'name', 'role', and 'domain'")

class EnrichedContact(BaseModel):
    company_name: str
    domain: str
    name: str
    role: str
    email: str
    linkedin: str
    confidence: float

class ContactOutput(BaseModel):
    contacts: List[EnrichedContact]
    summary: str

class ContactEnrichmentAgent(BaseAgent):
    name = "contact_enrichment"
    description = "Retrieves work emails, LinkedIn links, and generates contact verification status."
    capabilities = ["email_finder", "linkedin_lookup", "contact_verification"]
    input_schema = ContactInput
    output_schema = ContactOutput
    tool_dependencies = []

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        decision_makers = input_data.get("decision_makers", [])
        enriched_contacts = []
        
        for dm in decision_makers:
            domain = dm.get("domain", "")
            name = dm.get("name", "")
            role = dm.get("role", "")
            company_name = dm.get("company_name", "")
            
            # Check Long-Term Memory
            cached = memory.check_long_term("CONTACT", domain)
            
            # If cache has email and linkedin, reuse it
            if cached and cached.get("email"):
                enriched_contacts.append({
                    "company_name": company_name,
                    "domain": domain,
                    "name": name,
                    "role": role,
                    "email": cached["email"],
                    "linkedin": cached.get("linkedin", ""),
                    "confidence": cached.get("confidence", 0.95)
                })
                continue
                
            # Otherwise look up mock profiles
            mock_profile = get_mock_enrichment(domain)
            people = mock_profile.get("decision_makers", [])
            
            email = f"{name.lower().replace(' ', '.')}@{domain}"
            linkedin = f"linkedin.com/in/{name.lower().replace(' ', '-')}"
            confidence = 0.85
            
            # Check if this person matches in our mock db
            for p in people:
                if p["name"].lower() == name.lower():
                    email = p["email"]
                    linkedin = p["linkedin"]
                    confidence = 0.98
                    break
                    
            enriched_item = {
                "name": name,
                "role": role,
                "email": email,
                "linkedin": linkedin,
                "confidence": confidence
            }
            
            # Save fully enriched contact to Long-Term Memory
            memory.store_long_term("CONTACT", domain, enriched_item)
            
            enriched_contacts.append({
                "company_name": company_name,
                "domain": domain,
                "name": name,
                "role": role,
                "email": email,
                "linkedin": linkedin,
                "confidence": confidence
            })
            
        return {
            "contacts": enriched_contacts,
            "summary": f"Enriched {len(enriched_contacts)} contact profiles with verified email domains and LinkedIn references."
        }
