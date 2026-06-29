"""
discovery_agent.py — Discovery Agent

Finds companies matching the ICP using Google Custom Search API.
Falls back to curated mock data so the demo always works.
"""

import os
from .base_agent import BaseAgent
from ..llm import ask_json
from ..tools.search_tool import google_cse_search

# Curated mock companies for demo fallback
MOCK_COMPANIES = [
    # --- AI Healthcare ---
    {
        "name": "Niramai Health Analytix",
        "url": "https://niramai.com",
        "industry": "AI Healthcare",
        "location": "India",
        "stage": "Seed",
        "description": "AI-powered breast cancer screening using thermal imaging",
    },
    {
        "name": "Tricog Health",
        "url": "https://tricog.com",
        "industry": "AI Healthcare",
        "location": "India",
        "stage": "Series A",
        "description": "Real-time ECG interpretation using AI for cardiac care",
    },
    {
        "name": "Qure.ai",
        "url": "https://qure.ai",
        "industry": "AI Healthcare",
        "location": "India",
        "stage": "Series B",
        "description": "Deep learning for radiology and medical imaging interpretation",
    },
    {
        "name": "SigTuple",
        "url": "https://sigtuple.com",
        "industry": "AI Healthcare",
        "location": "India",
        "stage": "Series A",
        "description": "AI-powered medical data analysis for pathology and diagnostics",
    },
    {
        "name": "Innovaccer",
        "url": "https://innovaccer.com",
        "industry": "AI Healthcare",
        "location": "India",
        "stage": "Series D",
        "description": "Healthcare data platform unifying patient records with AI insights",
    },
    # --- Fintech ---
    {
        "name": "Razorpay",
        "url": "https://razorpay.com",
        "industry": "Fintech",
        "location": "India",
        "stage": "Series E",
        "description": "Online payment gateway and business banking platform for enterprises",
    },
    {
        "name": "CRED",
        "url": "https://cred.club",
        "industry": "Fintech",
        "location": "India",
        "stage": "Series D",
        "description": "Credit card rewards and bill payment platform offering financial services",
    },
    {
        "name": "Slice Card",
        "url": "https://sliceit.com",
        "industry": "Fintech",
        "location": "India",
        "stage": "Series C",
        "description": "Financial tech company offering credit card services and payments",
    },
    {
        "name": "Jupiter Money",
        "url": "https://jupiter.money",
        "industry": "Fintech",
        "location": "India",
        "stage": "Series B",
        "description": "Digital banking app offering smart savings accounts and money tracking",
    },
    # --- SaaS / DevTools ---
    {
        "name": "Zoho Corp",
        "url": "https://zoho.com",
        "industry": "SaaS",
        "location": "India",
        "stage": "Bootstrap",
        "description": "Suite of online business, collaboration, and productivity applications",
    },
    {
        "name": "Freshworks",
        "url": "https://freshworks.com",
        "industry": "SaaS",
        "location": "India",
        "stage": "IPO",
        "description": "Cloud-based customer service software and CRM dashboard solutions",
    },
    {
        "name": "Postman",
        "url": "https://postman.com",
        "industry": "SaaS",
        "location": "India",
        "stage": "Series D",
        "description": "Collaboration platform for API development, testing, and documentation",
    },
    {
        "name": "BrowserStack",
        "url": "https://browserstack.com",
        "industry": "SaaS",
        "location": "India",
        "stage": "Series B",
        "description": "Cloud web and mobile testing platform for developers and QA teams",
    },
    # --- E-commerce / Logistics ---
    {
        "name": "Meesho",
        "url": "https://meesho.com",
        "industry": "E-commerce",
        "location": "India",
        "stage": "Series F",
        "description": "Social commerce marketplace connecting resellers and small businesses",
    },
    {
        "name": "Zepto Delivery",
        "url": "https://zepto.com",
        "industry": "E-commerce",
        "location": "India",
        "stage": "Series E",
        "description": "10-minute grocery delivery app serving major metropolitan areas",
    },
    # --- AI Video / Media ---
    {
        "name": "InVideo AI",
        "url": "https://invideo.io",
        "industry": "AI Video Editing",
        "location": "India",
        "stage": "Series B",
        "description": "AI video generation platform converting text scripts into complete videos with voiceovers",
    },
    {
        "name": "Synthesia",
        "url": "https://synthesia.io",
        "industry": "AI Video Editing",
        "location": "United Kingdom",
        "stage": "Series C",
        "description": "AI video creation platform using digital avatars to speak text scripts dynamically",
    },
    {
        "name": "Runway",
        "url": "https://runwayml.com",
        "industry": "AI Video Editing",
        "location": "United States",
        "stage": "Series C",
        "description": "Generative AI tools for video generation, video editing, and text-to-video diffusion models",
    },
    {
        "name": "Kaiber AI",
        "url": "https://kaiber.ai",
        "industry": "AI Video Editing",
        "location": "United States",
        "stage": "Seed",
        "description": "Creative AI video platform generating animations from images and text audio prompts",
    },
]


class DiscoveryAgent(BaseAgent):
    name = "discovery"
    description = "Finds companies matching the ICP via Google CSE or curated mock data."

    def run(self, icp: dict | None = None, **kwargs) -> list[dict]:
        self.log_start({"icp": icp})
        icp = icp or {}

        companies = self._google_cse_search(icp)
        if not companies:
            self.logger.info("Google CSE unavailable or returned 0 results — trying LLM discovery")
            companies = self._llm_discovery(icp)

        if not companies:
            self.logger.info("LLM discovery failed — using static mock data")
            companies = self._filtered_mock(icp)

        self.log_done(f"Discovered {len(companies)} companies")
        return companies

    def _llm_discovery(self, icp: dict) -> list[dict]:
        industry = icp.get("industry", "AI")
        location = icp.get("location", "Global")
        stage = icp.get("stage", "Seed")
        tech_keywords = ", ".join(icp.get("tech_keywords", []))

        prompt = f"""
You are a startup discovery assistant for a venture capital firm.
Find or generate exactly 4 real or highly plausible active companies matching this Ideal Customer Profile (ICP):
- Target Industry: {industry}
- Funding Stage: {stage}
- Geography: {location}
- Technology Focus: {tech_keywords}

Return ONLY a JSON array of objects, where each object has these exact keys:
[
  {{
    "name": "Company Name",
    "url": "https://companydomain.com",
    "description": "2-sentence description of the company's product, tech stack, and what they do",
    "industry": "{industry}",
    "location": "{location}",
    "stage": "{stage}",
    "source": "llm_discovery"
  }}
]

Make sure the URLs are plausible and formatted correctly. Return ONLY valid raw JSON. No markdown code blocks.
"""
        result = ask_json(prompt, fallback=[])
        if isinstance(result, list):
            valid_companies = []
            for item in result:
                if isinstance(item, dict) and "name" in item and "url" in item:
                    item.setdefault("industry", industry)
                    item.setdefault("location", location)
                    item.setdefault("stage", stage)
                    item.setdefault("source", "llm_discovery")
                    valid_companies.append(item)
            return valid_companies
        return []

    def _google_cse_search(self, icp: dict) -> list[dict]:
        api_key = os.getenv("GOOGLE_CSE_API_KEY", "")
        cse_id = os.getenv("GOOGLE_CSE_ID", "")
        industry = icp.get("industry", "AI")
        location = icp.get("location", "")
        stage = icp.get("stage", "startup")
        query = f"{industry} startup {location} {stage} 2024"
        results = google_cse_search(query, api_key, cse_id)
        return [
            {
                "name": r["title"],
                "url": r["url"],
                "description": r["snippet"],
                "industry": icp.get("industry", ""),
                "location": icp.get("location", ""),
                "stage": icp.get("stage", ""),
                "source": "google_cse",
            }
            for r in results
        ]

    def _filtered_mock(self, icp: dict) -> list[dict]:
        """Return mock companies filtered by ICP industry keyword."""
        keyword = icp.get("industry", "").lower()
        matched = [
            c
            for c in MOCK_COMPANIES
            if not keyword
            or keyword in c.get("industry", "").lower()
            or keyword in c.get("description", "").lower()
        ]
        if matched:
            return matched

        # Dynamic fallback: If no static mock matches, create plausible ones based on target ICP parameters
        industry_title = icp.get("industry", "SaaS").title()
        location = icp.get("location", "India")
        stage = icp.get("stage", "Seed")
        tech_words = ", ".join(icp.get("tech_keywords", ["AI", "ML"]))

        # Remove spaces or dots for clean URLs
        domain_safe = industry_title.lower().replace(" ", "").replace(".", "")

        return [
            {
                "name": f"{industry_title} Flow",
                "url": f"https://{domain_safe}flow.com",
                "industry": industry_title,
                "location": location,
                "stage": stage,
                "description": f"Next-generation {industry_title} automation platform powered by {tech_words} to streamline business operations.",
                "source": "mock_discovery",
            },
            {
                "name": f"{industry_title} Hub",
                "url": f"https://{domain_safe}hub.co",
                "industry": industry_title,
                "location": location,
                "stage": stage,
                "description": f"Collaborative cloud workspace built specifically for {industry_title} using {tech_words} workflows.",
                "source": "mock_discovery",
            },
            {
                "name": f"Nova {industry_title}",
                "url": f"https://nova{domain_safe}.io",
                "industry": industry_title,
                "location": location,
                "stage": stage,
                "description": f"Innovative technology systems optimized for {industry_title} leveraging {tech_words}.",
                "source": "mock_discovery",
            },
            {
                "name": f"Aero {industry_title}",
                "url": f"https://aero{domain_safe}.com",
                "industry": industry_title,
                "location": location,
                "stage": stage,
                "description": f"Enterprise-grade software designed to scale {industry_title} using secure {tech_words} models.",
                "source": "mock_discovery",
            },
        ]
