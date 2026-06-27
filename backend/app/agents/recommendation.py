from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class RecommendationInput(BaseModel):
    contacts: List[Dict[str, Any]] = Field(description="Enriched contacts list")
    enriched_companies: List[Dict[str, Any]] = Field(description="Enriched companies profiles list")

class RecommendedLead(BaseModel):
    company_name: str
    domain: str
    name: str
    role: str
    email: str
    linkedin: str
    confidence_score: float
    recommendation_reason: str
    outreach_email: str

class RecommendationOutput(BaseModel):
    recommendations: List[RecommendedLead]
    summary: str

class RecommendationAgent(BaseAgent):
    name = "recommendation"
    description = "Analyzes company data and personas to calculate qualification fit, confidence scores, and outreach drafts."
    capabilities = ["lead_scoring", "outreach_generation", "fit_analysis"]
    input_schema = RecommendationInput
    output_schema = RecommendationOutput
    tool_dependencies = []

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        contacts = input_data.get("contacts", [])
        companies = input_data.get("enriched_companies", [])
        
        recommendations = []
        
        # Build mapping of company domain to company details
        company_map = {c["domain"]: c for c in companies}
        
        # Load criteria from Knowledge Memory
        min_size = memory.get_knowledge_rule("min_size", 10)
        target_technologies = memory.get_knowledge_rule("target_technologies", [])
        
        for contact in contacts:
            domain = contact.get("domain", "")
            company = company_map.get(domain, {})
            
            # Simple Scoring Model
            score = 0.70 # baseline score
            
            # Check technology fit
            tech_stack = company.get("tech_stack", "").lower()
            matching_techs = []
            for tech in target_technologies:
                if tech.lower() in tech_stack:
                    score += 0.05
                    matching_techs.append(tech)
                    
            # Check hiring status
            hiring = company.get("hiring_status", "").lower()
            if "hiring" in hiring or "openings" in hiring:
                score += 0.10
                
            # Check location
            location = company.get("location", "")
            
            # Cap score at 0.98
            score = min(0.98, score)
            
            # Formulate reasoning
            tech_match_text = f" Matches tech stack ({', '.join(matching_techs)})." if matching_techs else ""
            hiring_text = f" Actively hiring ({company.get('hiring_status')})." if "hiring" in hiring else ""
            funding_text = f" Recently raised capital ({company.get('funding_status')})." if company.get("funding_status") else ""
            
            reason = f"Highly qualified lead in {company.get('location')}.{tech_match_text}{hiring_text}{funding_text}"
            
            # Generate Outreach Email draft
            outreach_email = (
                f"Subject: Scalability & AI Engineering at {company.get('name')}\n\n"
                f"Hi {contact.get('name')},\n\n"
                f"I noticed that {company.get('name')} is expanding your engineering capabilities in {location}, "
                f"specifically hiring around your {company.get('hiring_status', 'technical roles')}.\n\n"
                f"Given your stack utilizes {company.get('tech_stack')}, our AI recruitment workflows can fast-track "
                f"vetted engineer sourcing for your team. Would love to share how we achieved a 40% reduction in time-to-hire "
                f"for similar Series A firms.\n\n"
                f"Best regards,\n"
                f"ProspectPilot AI Team"
            )
            
            recommendations.append({
                "company_name": company.get("name"),
                "domain": domain,
                "name": contact.get("name"),
                "role": contact.get("role"),
                "email": contact.get("email"),
                "linkedin": contact.get("linkedin"),
                "confidence_score": round(score, 2),
                "recommendation_reason": reason,
                "outreach_email": outreach_email,
                # Add raw company detail references
                "industry": company.get("industry"),
                "company_size": company.get("company_size"),
                "location": location,
                "tech_stack": company.get("tech_stack"),
                "funding_status": company.get("funding_status"),
                "hiring_status": company.get("hiring_status")
            })
            
        return {
            "recommendations": recommendations,
            "summary": f"Calculated lead priority scores and drafted outreach strategies for {len(recommendations)} matches."
        }
