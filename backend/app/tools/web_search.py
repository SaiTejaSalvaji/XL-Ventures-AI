import os
import httpx
from pydantic import BaseModel, Field
from backend.app.tools.base import BaseTool
from backend.app.tools.mock_data import search_mock_companies

class SearchInput(BaseModel):
    query: str = Field(description="Search engine query string")

class WebSearchTool(BaseTool):
    name = "web_search"
    description = "Searches the web for business information, industry trends, hiring data, or company details."
    args_schema = SearchInput

    async def execute(self, query: str) -> dict:
        tavily_key = os.getenv("TAVILY_API_KEY")
        
        # Real search if API key present
        if tavily_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.tavily.com/search",
                        json={"api_key": tavily_key, "query": query, "search_depth": "smart"}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return {
                            "source": "tavily",
                            "results": [
                                {"title": r.get("title"), "url": r.get("url"), "content": r.get("content")}
                                for r in data.get("results", [])
                            ]
                        }
            except Exception as e:
                # Log error and fall back to mock
                pass

        # Fallback to Mock Search
        mock_results = search_mock_companies(query)
        results = []
        for index, item in enumerate(mock_results):
            results.append({
                "title": f"{item['name']} - {item['industry']}",
                "url": f"https://www.{item['domain']}",
                "content": f"Location: {item['location']}. Size: {item['company_size']}. Tech: {item['tech_stack']}. Funding: {item['funding_status']}. Hiring: {item['hiring_status']}. About: {item['website_text'][:100]}..."
            })
            
        return {
            "source": "mock_search_engine",
            "results": results
        }
