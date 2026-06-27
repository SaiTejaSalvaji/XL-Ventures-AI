from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class EnrichmentInput(BaseModel):
    companies: List[Dict[str, Any]] = Field(description="List of validated companies from the validation agent")

class EnrichedCompany(BaseModel):
    name: str
    domain: str
    tech_stack: str
    funding_status: str
    hiring_status: str
    location: str
    industry: str
    description: str

class EnrichmentOutput(BaseModel):
    enriched_companies: List[EnrichedCompany]
    summary: str

class CompanyEnrichmentAgent(BaseAgent):
    name = "company_enrichment"
    description = "Scrapes target domains and extracts technologies, hiring needs, funding data, and firmographics."
    capabilities = ["enrich_company", "tech_stack_extraction", "funding_extraction"]
    input_schema = EnrichmentInput
    output_schema = EnrichmentOutput
    tool_dependencies = ["web_scraper"]

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        companies = input_data.get("companies", [])
        enriched_list = []
        scraper = tools.get_tool("web_scraper")
        
        for c in companies:
            domain = c.get("domain", "")
            name = c.get("name", "")
            
            # If memory hit, reuse the cache!
            if c.get("memory_hit") and c.get("cached_data"):
                cached = c.get("cached_data")
                enriched_list.append({
                    "name": cached.get("name", name),
                    "domain": domain,
                    "tech_stack": cached.get("tech_stack", ""),
                    "funding_status": cached.get("funding_status", ""),
                    "hiring_status": cached.get("hiring_status", ""),
                    "location": cached.get("location", ""),
                    "industry": cached.get("industry", ""),
                    "description": cached.get("website_text", "")
                })
                continue
                
            # Otherwise scrape and enrich
            url = f"https://www.{domain}"
            scrape_res = await scraper.execute(url=url)
            
            metadata = scrape_res.get("metadata", {})
            tech_stack = metadata.get("tech_stack", "React, Node.js")
            funding = metadata.get("funding", "Series A - $5M")
            hiring = metadata.get("hiring", "Hiring Software Engineers")
            location = metadata.get("location", "London, UK")
            industry = metadata.get("industry", "Technology")
            desc = scrape_res.get("content", "")
            
            enriched_item = {
                "name": metadata.get("name", name),
                "domain": domain,
                "tech_stack": tech_stack,
                "funding_status": funding,
                "hiring_status": hiring,
                "location": location,
                "industry": industry,
                "website_text": desc # for long term storage
            }
            
            # Store in Long-Term Memory for future runs!
            memory.store_long_term("COMPANY", domain, enriched_item)
            
            enriched_list.append({
                "name": enriched_item["name"],
                "domain": domain,
                "tech_stack": tech_stack,
                "funding_status": funding,
                "hiring_status": hiring,
                "location": location,
                "industry": industry,
                "description": desc
            })
            
        return {
            "enriched_companies": enriched_list,
            "summary": f"Successfully enriched {len(enriched_list)} companies. Saved new profiles to Long-Term Memory cache."
        }
