from typing import Dict, Any, List, Type
from pydantic import BaseModel
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class BaseAgent:
    name: str
    description: str
    capabilities: List[str]
    input_schema: Type[BaseModel]
    output_schema: Type[BaseModel]
    tool_dependencies: List[str] = []
    priority: int = 1
    retry_policy: Dict[str, Any] = {"max_retries": 3, "backoff_factor": 2.0}
    memory_access: bool = True

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        raise NotImplementedError("Agents must implement the run method.")

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "capabilities": self.capabilities,
            "input_schema": self.input_schema.schema() if self.input_schema else None,
            "output_schema": self.output_schema.schema() if self.output_schema else None,
            "tool_dependencies": self.tool_dependencies,
            "priority": self.priority,
            "retry_policy": self.retry_policy,
            "memory_access": self.memory_access
        }
