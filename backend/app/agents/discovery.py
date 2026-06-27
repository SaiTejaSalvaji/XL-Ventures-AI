from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class DiscoveryInput(BaseModel):
    industry: str = Field(description="Target industry (e.g. IT Staffing, AI SaaS)")
    location: str = Field(description="Target country or city (e.g. United Kingdom, San Francisco)")
    keywords: List[str] = Field(default=[], description="Keywords matching hiring posts or funding")

class DiscoveredCompany(BaseModel):
    name: str
    domain: str
    location: str
    industry: str

class DiscoveryOutput(BaseModel):
    companies: List[DiscoveredCompany]
    summary: str

class CompanyDiscoveryAgent(BaseAgent):
    name = "company_discovery"
    description = "Searches for companies matching the target industry, location, and key descriptors."
    capabilities = ["discover_companies", "domain_extraction", "query_formulation"]
    input_schema = DiscoveryInput
    output_schema = DiscoveryOutput
    tool_dependencies = ["web_search"]

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        industry = input_data.get("industry", "IT Recruitment")
        location = input_data.get("location", "London")
        keywords = input_data.get("keywords", [])
        
        # Build query
        keyword_str = " ".join(keywords)
        query = f"Companies in {industry} in {location} {keyword_str}"
        
        search_tool = tools.get_tool("web_search")
        search_results = await search_tool.execute(query=query)
        
        discovered = []
        # If mock search was run, we can extract details easily
        results = search_results.get("results", [])
        
        for r in results:
            title = r.get("title", "")
            url = r.get("url", "")
            content = r.get("content", "")
            
            # Simple domain extraction from URL
            domain = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
            
            # Extract clean company name
            company_name = title.split(" - ")[0] if " - " in title else title
            company_name = company_name.replace("Website", "").strip()
            
            discovered.append({
                "name": company_name,
                "domain": domain,
                "location": location,
                "industry": industry
            })
            
        return {
            "companies": discovered,
            "summary": f"Discovered {len(discovered)} potential companies matching '{industry}' in '{location}'."
        }
