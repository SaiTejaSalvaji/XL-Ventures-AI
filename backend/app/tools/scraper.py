import os
import httpx
from pydantic import BaseModel, Field
from backend.app.tools.base import BaseTool
from backend.app.tools.mock_data import get_mock_enrichment

class ScraperInput(BaseModel):
    url: str = Field(description="Website URL to scrape")

class WebScraperTool(BaseTool):
    name = "web_scraper"
    description = "Scrapes a web page to extract raw text, technology stack, hiring details, or contact information."
    args_schema = ScraperInput

    async def execute(self, url: str) -> dict:
        # Determine domain from URL
        clean_url = url.replace("https://", "").replace("http://", "").replace("www.", "")
        domain = clean_url.split("/")[0]

        firecrawl_key = os.getenv("FIRECRAWL_API_KEY")
        if firecrawl_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.firecrawl.dev/v0/scrape",
                        headers={"Authorization": f"Bearer {firecrawl_key}"},
                        json={"url": url, "pageOptions": {"onlyMainContent": True}}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return {
                            "source": "firecrawl",
                            "url": url,
                            "content": data.get("data", {}).get("content", "")
                        }
            except Exception:
                pass

        # Fallback Scraper Mocking
        mock_data = get_mock_enrichment(domain)
        return {
            "source": "mock_scraper",
            "url": url,
            "content": mock_data["website_text"],
            "metadata": {
                "name": mock_data["name"],
                "tech_stack": mock_data["tech_stack"],
                "funding": mock_data["funding_status"],
                "hiring": mock_data["hiring_status"],
                "location": mock_data["location"],
                "size": mock_data["company_size"]
            }
        }
