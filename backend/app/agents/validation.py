from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class ValidationInput(BaseModel):
    companies: List[Dict[str, str]] = Field(description="List of companies with 'name' and 'domain'")

class ValidatedCompany(BaseModel):
    name: str
    domain: str
    is_valid: bool
    is_duplicate: bool
    memory_hit: bool
    cached_data: Dict[str, Any] = None

class ValidationOutput(BaseModel):
    validated_companies: List[ValidatedCompany]
    summary: str

class CompanyValidationAgent(BaseAgent):
    name = "company_validation"
    description = "Validates company websites, domain structures, and checks for duplicates in Long-Term Memory."
    capabilities = ["validate_domain", "duplicate_detection", "memory_lookup"]
    input_schema = ValidationInput
    output_schema = ValidationOutput
    tool_dependencies = []

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        companies = input_data.get("companies", [])
        validated_list = []
        hits = 0
        duplicates = 0
        
        for c in companies:
            name = c.get("name", "")
            domain = c.get("domain", "").lower().strip()
            
            if not domain or "." not in domain:
                validated_list.append({
                    "name": name,
                    "domain": domain,
                    "is_valid": False,
                    "is_duplicate": False,
                    "memory_hit": False,
                    "cached_data": None
                })
                continue
                
            # Check Long-Term Memory
            cached = memory.check_long_term("COMPANY", domain)
            
            if cached:
                hits += 1
                validated_list.append({
                    "name": name,
                    "domain": domain,
                    "is_valid": True,
                    "is_duplicate": True,
                    "memory_hit": True,
                    "cached_data": cached
                })
            else:
                validated_list.append({
                    "name": name,
                    "domain": domain,
                    "is_valid": True,
                    "is_duplicate": False,
                    "memory_hit": False,
                    "cached_data": None
                })

        return {
            "validated_companies": validated_list,
            "summary": f"Validated {len(companies)} domains. Found {hits} long-term memory hits and {duplicates} duplicate entries."
        }
