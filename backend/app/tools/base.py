from typing import Dict, Any, Type
from pydantic import BaseModel

class BaseTool:
    name: str
    description: str
    args_schema: Type[BaseModel] = None

    async def execute(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("Tools must implement the execute method.")

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "args_schema": self.args_schema.schema() if self.args_schema else None
        }
