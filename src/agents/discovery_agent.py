"""
discovery_agent.py — Discovery Agent

Finds companies matching the ICP using Google Custom Search API.
Falls back to curated mock data so the demo always works.
"""

import os
import requests
from .base_agent import BaseAgent

# Curated mock companies for demo fallback
MOCK_COMPANIES = [
    {"name": "Niramai Health Analytix", "url": "https://niramai.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Seed",
     "description": "AI-powered breast cancer screening using thermal imaging"},
    {"name": "Tricog Health", "url": "https://tricog.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Series A",
     "description": "Real-time ECG interpretation using AI for cardiac care"},
    {"name": "Qure.ai", "url": "https://qure.ai",
     "industry": "AI Healthcare", "location": "India", "stage": "Series B",
     "description": "Deep learning for radiology and medical imaging interpretation"},
    {"name": "SigTuple", "url": "https://sigtuple.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Series A",
     "description": "AI-powered medical data analysis for pathology and diagnostics"},
    {"name": "Innovaccer", "url": "https://innovaccer.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Series D",
     "description": "Healthcare data platform unifying patient records with AI insights"},
    {"name": "Artelus", "url": "https://artelus.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Seed",
     "description": "AI for instant diabetic retinopathy detection"},
    {"name": "Predible Health", "url": "https://prediblehealth.com",
     "industry": "AI Healthcare", "location": "India", "stage": "Seed",
     "description": "AI radiology platform for lung and liver disease detection"},
]


class DiscoveryAgent(BaseAgent):
    name = "discovery"
    description = "Finds companies matching the ICP via Google CSE or curated mock data."

    def run(self, icp: dict | None = None, **kwargs) -> list[dict]:
        self.log_start({"icp": icp})
        icp = icp or {}

        companies = self._google_cse_search(icp)
        if not companies:
            self.logger.info("Google CSE unavailable or returned 0 results — using mock data")
            companies = self._filtered_mock(icp)

        self.log_done(f"Discovered {len(companies)} companies")
        return companies

    def _google_cse_search(self, icp: dict) -> list[dict]:
        api_key = os.getenv("GOOGLE_CSE_API_KEY", "")
        cse_id = os.getenv("GOOGLE_CSE_ID", "")
        if not api_key or not cse_id:
            return []

        industry = icp.get("industry", "AI")
        location = icp.get("location", "")
        stage = icp.get("stage", "startup")
        query = f"{industry} startup {location} {stage} 2024"

        try:
            resp = requests.get(
                "https://www.googleapis.com/customsearch/v1",
                params={"key": api_key, "cx": cse_id, "q": query, "num": 10},
                timeout=10,
            )
            items = resp.json().get("items", [])
            return [
                {
                    "name": item.get("title", "").split(" - ")[0].strip(),
                    "url": item.get("link", ""),
                    "description": item.get("snippet", ""),
                    "industry": icp.get("industry", ""),
                    "location": icp.get("location", ""),
                    "stage": icp.get("stage", ""),
                    "source": "google_cse",
                }
                for item in items
                if item.get("link", "").startswith("http")
            ]
        except Exception as e:
            self.logger.warning(f"Google CSE failed: {e}")
            return []

    def _filtered_mock(self, icp: dict) -> list[dict]:
        """Return mock companies filtered by ICP industry keyword."""
        keyword = icp.get("industry", "").lower()
        return [
            c for c in MOCK_COMPANIES
            if not keyword or keyword in c.get("industry", "").lower()
                            or keyword in c.get("description", "").lower()
        ] or MOCK_COMPANIES[:5]
