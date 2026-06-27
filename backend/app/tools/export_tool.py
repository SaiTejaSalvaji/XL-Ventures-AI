import os
import json
import csv
from io import StringIO
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.tools.base import BaseTool

class ExportInput(BaseModel):
    leads: List[Dict[str, Any]] = Field(description="List of lead dictionaries to export")
    format_type: str = Field(description="Export file format: 'csv', 'json', or 'pdf'")
    filename: str = Field(default="prospects_export", description="Name of the file without extension")

class ExportTool(BaseTool):
    name = "export_tool"
    description = "Exports a list of lead profiles into CSV, PDF, or JSON formatted files."
    args_schema = ExportInput

    async def execute(self, leads: List[Dict[str, Any]], format_type: str, filename: str = "prospects_export") -> dict:
        os.makedirs("./exports", exist_ok=True)
        format_type = format_type.lower()
        
        file_path = ""
        content_type = ""
        
        if format_type == "csv":
            file_path = f"./exports/{filename}.csv"
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                # Write header
                writer.writerow([
                    "Company", "Domain", "Industry", "Location", "Size", "Tech Stack", 
                    "Funding", "Hiring", "Decision Maker", "Role", "Email", "LinkedIn", "Lead Score", "Reasoning"
                ])
                # Write rows
                for lead in leads:
                    writer.writerow([
                        lead.get("company_name", ""),
                        lead.get("domain", ""),
                        lead.get("industry", ""),
                        lead.get("location", ""),
                        lead.get("company_size", ""),
                        lead.get("tech_stack", ""),
                        lead.get("funding_status", ""),
                        lead.get("hiring_status", ""),
                        lead.get("decision_maker_name", ""),
                        lead.get("decision_maker_role", ""),
                        lead.get("decision_maker_email", ""),
                        lead.get("decision_maker_linkedin", ""),
                        lead.get("confidence_score", 0.0),
                        lead.get("recommendation_reason", "")
                    ])
            content_type = "text/csv"
            
        elif format_type == "json":
            file_path = f"./exports/{filename}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(leads, f, indent=2)
            content_type = "application/json"
            
        else: # pdf or general fallback
            file_path = f"./exports/{filename}.txt" # We save a clean readable text report
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"PROSPECT PILOT AI - LEAD EXPORT REPORT\n")
                f.write(f"Generated at: {os.path.basename(file_path)}\n")
                f.write("="*80 + "\n\n")
                for index, lead in enumerate(leads):
                    f.write(f"{index+1}. COMPANY: {lead.get('company_name')} ({lead.get('domain')})\n")
                    f.write(f"   Industry: {lead.get('industry')} | Location: {lead.get('location')} | Size: {lead.get('company_size')}\n")
                    f.write(f"   Tech Stack: {lead.get('tech_stack')}\n")
                    f.write(f"   Funding: {lead.get('funding_status')} | Hiring: {lead.get('hiring_status')}\n")
                    f.write(f"   Decision Maker: {lead.get('decision_maker_name')} ({lead.get('decision_maker_role')})\n")
                    f.write(f"   Contact: Email: {lead.get('decision_maker_email')} | LinkedIn: {lead.get('decision_maker_linkedin')}\n")
                    f.write(f"   Lead Fit Score: {lead.get('confidence_score')}/1.0\n")
                    f.write(f"   Reasoning: {lead.get('recommendation_reason')}\n")
                    f.write("-"*80 + "\n\n")
            content_type = "text/plain"

        return {
            "success": True,
            "filename": f"{filename}.{format_type if format_type in ['csv', 'json'] else 'txt'}",
            "file_path": file_path,
            "content_type": content_type,
            "total_leads_exported": len(leads)
        }
