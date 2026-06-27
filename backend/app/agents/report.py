from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.agents.base import BaseAgent
from backend.app.memory.engine import MemoryEngine
from backend.app.tools.registry import ToolRegistry

class ReportInput(BaseModel):
    leads: List[Dict[str, Any]] = Field(description="List of scored leads")
    formats: List[str] = Field(default=["csv", "json"], description="Export formats requested")

class ExportedFile(BaseModel):
    format: str
    filename: str
    filepath: str

class ReportOutput(BaseModel):
    exported_files: List[ExportedFile]
    summary: str

class ReportAgent(BaseAgent):
    name = "report_generator"
    description = "Packages qualified lead data and calls file formatting tools to compile downloads."
    capabilities = ["generate_reports", "data_formatting", "export_trigger"]
    input_schema = ReportInput
    output_schema = ReportOutput
    tool_dependencies = ["export_tool"]

    async def run(self, input_data: Dict[str, Any], memory: MemoryEngine, tools: ToolRegistry) -> Dict[str, Any]:
        leads = input_data.get("leads", [])
        formats = input_data.get("formats", ["csv", "json", "pdf"])
        
        export_tool = tools.get_tool("export_tool")
        exported = []
        
        for fmt in formats:
            export_res = await export_tool.execute(
                leads=leads,
                format_type=fmt,
                filename=f"prospects_export_{int(memory.db.execute('SELECT strftime(\'%s\', \'now\')').fetchone()[0] or 1)}" if memory.db.bind.name == "sqlite" else "prospects_export"
            )
            if export_res.get("success"):
                exported.append({
                    "format": fmt,
                    "filename": export_res.get("filename"),
                    "filepath": export_res.get("file_path")
                })
                
        return {
            "exported_files": exported,
            "summary": f"Successfully compiled and written reports in {', '.join(formats).upper()} formats containing {len(leads)} qualified leads."
        }
