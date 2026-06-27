from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry
from backend.app.tools.mock_data import get_mock_enrichment

class DecisionMakerInput(BaseModel):
    companies: List[Dict[str, Any]] = Field(description="List of enriched companies")
    target_personas: List[str] = Field(default=["CTO", "VP Engineering", "Director of Engineering"], description="Roles to identify")

class MatchedPerson(BaseModel):
    company_name: str
    domain: str
    name: str
    role: str

class DecisionMakerOutput(BaseModel):
    decision_makers: List[MatchedPerson]
    summary: str

class DecisionMakerAgent(BaseAgent):
    name = "decision_maker"
    description = "Identifies target decision makers (CTOs, VPs of Engineering, Founders) within enriched companies."
    capabilities = ["identify_personas", "role_matching"]
    input_schema = DecisionMakerInput
    output_schema = DecisionMakerOutput
    tool_dependencies = ["web_search"]

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        companies = input_data.get("companies", [])
        personas = input_data.get("target_personas", ["CTO", "VP Engineering", "Founder"])
        matched_decision_makers = []
        
        # Format personas to lowercase for matching
        personas_lower = [p.lower() for p in personas]
        
        for c in companies:
            domain = c.get("domain", "")
            company_name = c.get("name", "")
            
            # Check Long-Term Memory for CONTACT cached under this domain
            cached_contact = memory.check_long_term("CONTACT", domain)
            
            if cached_contact:
                matched_decision_makers.append({
                    "company_name": company_name,
                    "domain": domain,
                    "name": cached_contact.get("name", ""),
                    "role": cached_contact.get("role", "")
                })
                continue
                
            # If not in cache, load mock data for that domain
            mock_profile = get_mock_enrichment(domain)
            people = mock_profile.get("decision_makers", [])
            
            # Find the best matching persona
            best_match = None
            for person in people:
                role_lower = person["role"].lower()
                # Check if any target persona keyword is in the role
                if any(p in role_lower for p in personas_lower):
                    best_match = person
                    break
                    
            if not best_match and people:
                # Default to first person if no persona matched
                best_match = people[0]
                
            if best_match:
                matched_decision_makers.append({
                    "company_name": company_name,
                    "domain": domain,
                    "name": best_match["name"],
                    "role": best_match["role"]
                })
                # Cache basic contact reference in memory (without email first)
                memory.store_long_term("CONTACT", domain, {
                    "name": best_match["name"],
                    "role": best_match["role"]
                })
            else:
                # Standard fallback contact
                matched_decision_makers.append({
                    "company_name": company_name,
                    "domain": domain,
                    "name": "Jane Doe",
                    "role": "Talent Acquisition Lead"
                })

        return {
            "decision_makers": matched_decision_makers,
            "summary": f"Identified {len(matched_decision_makers)} key decision makers matching target personas."
        }
