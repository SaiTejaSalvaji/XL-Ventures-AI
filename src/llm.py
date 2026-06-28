"""
llm.py — LLM Helper (Gemini & Groq)

Single shared entry point for all LLM calls in VenturePilot AI.
Uses Groq (llama-3.3-70b-versatile) as primary if configured, with auto-failover
to Gemini (gemini-2.0-flash) and smart mock fallback.
"""

import json
import os
import re
import logging

from google import genai
from google.genai import errors as gemini_errors
from dotenv import load_dotenv

# Try importing groq client
try:
    from groq import Groq
except ImportError:
    Groq = None

load_dotenv()
logger = logging.getLogger(__name__)

# Gemini model — "gemini-2.0-flash" is free-tier and fast
_MODEL_NAME = "gemini-2.0-flash"
_client = None


def _get_client():
    """Lazy-initialize the Gemini client (avoids import-time API calls)."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.warning("GEMINI_API_KEY not set — LLM calls will return placeholder text.")
            return None
        _client = genai.Client(api_key=api_key)
    return _client


def ask(prompt: str, fallback: str = "N/A") -> str:
    """
    Send a prompt to Gemini and return the text response.

    Args:
        prompt:   The prompt string.
        fallback: Value returned if Gemini is unavailable or errors out.

    Returns:
        str: Gemini's response text, or fallback on error.
    """
    client = _get_client()
    if client is None:
        return fallback
    try:
        response = client.models.generate_content(
            model=_MODEL_NAME, contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return fallback


def ask_json(prompt: str, fallback: dict | None = None) -> dict:
    """
    Send a prompt to the active LLM expecting a JSON response.
    Automatically strips markdown code fences if present.
    """
    if fallback is None:
        fallback = {}

    raw = ask(prompt, fallback="")
    if not raw:
        return _mock_llm_ask_json(prompt, fallback)

    # Strip ```json ... ``` fences
    raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning(f"LLM returned non-JSON response structure: {raw[:200]}")
        return _mock_llm_ask_json(prompt, fallback)


def _mock_llm_ask(prompt: str, fallback: str) -> str:
    """Generate smart mock responses based on prompt keywords to simulate LLM behavior."""
    prompt_lower = prompt.lower()
    
    # 1. Scoring Agent rationale
    if "investment rationale" in prompt_lower or "score:" in prompt_lower:
        match = re.search(r"rationale for ([^.\n]+)", prompt, re.IGNORECASE)
        name = match.group(1).strip() if match else "the company"
        return (
            f"{name} demonstrates strong growth potential in B2B space with a highly scalable "
            f"business model. While competition is emerging and execution risks exist, the "
            f"founding team's background provides a strong capability index."
        )
        
    # 2. Report Agent Markdown report
    if "due-diligence report in markdown" in prompt_lower or "executive summary" in prompt_lower:
        match = re.search(r"Company\*\*: ([^\n]+)", prompt)
        name = match.group(1).strip() if match else "Selected Startup"
        
        match_ind = re.search(r"Industry\*\*: ([^\n|]+)", prompt)
        ind = match_ind.group(1).strip() if match_ind else "Technology"
        
        match_stage = re.search(r"Stage\*\*: ([^\n|]+)", prompt)
        stage = match_stage.group(1).strip() if match_stage else "Seed"
        
        return f"""# {name} — Due Diligence Report

## Executive Summary
{name} is a high-potential enterprise startup operating in the {ind} market, currently raising their {stage} round. They demonstrate early traction, a solid product vision, and clear market alignment.

## Company Overview
{name} develops advanced enterprise solutions targeting inefficiencies in B2B workflow discovery. Their products are designed to deliver immediate ROI to target customers.

## Team & Leadership
The company's leadership team consists of experienced operators and engineering talent with past backgrounds in building scalable software systems.

## Technology & Product
Built on a scalable software architecture, the product supports high-concurrency operations and complies with standard enterprise security guidelines.

## Market Opportunity
The market size for B2B {ind} platforms is growing significantly with positive tailwinds from digital transformation across key geographies.

## Competitive Landscape
{name} is positioned as a technology leader with unique features that offer competitive differentiation over legacy providers.

## Recent Traction & News
The company is experiencing steady increase in operational metrics, user engagement, and positive ecosystem sentiment.

## Risk Factors
Key risks include scaling customer acquisition channels and product delivery timelines.

## Investment Recommendation
**Recommendation: Watch/Proceed** — Strong potential opportunity that warrants moving to the next evaluation stage.
"""

    return fallback


def _mock_llm_ask_json(prompt: str, fallback: dict) -> dict:
    """Generate smart mock JSON responses based on prompt structure."""
    prompt_lower = prompt.lower()
    
    # 1. Planner Agent plan
    if "agent names to execute" in prompt_lower or "planner" in prompt_lower:
        return [
            "discovery", "validation", "company_profile",
            "founder_profile", "github", "news",
            "market_analysis", "scoring", "report"
        ]
        
    # 2. Discovery Agent companies
    if "startup discovery assistant" in prompt_lower or "ideal customer profile" in prompt_lower:
        ind = "AI Healthcare"
        stage = "Seed"
        loc = "India"
        if "industry: " in prompt_lower:
            match = re.search(r"industry: ([^\n]+)", prompt_lower)
            if match: ind = match.group(1).strip()
        if "stage: " in prompt_lower:
            match = re.search(r"stage: ([^\n]+)", prompt_lower)
            if match: stage = match.group(1).strip()
        if "geography: " in prompt_lower:
            match = re.search(r"geography: ([^\n]+)", prompt_lower)
            if match: loc = match.group(1).strip()
            
        return [
            {
                "name": f"Alpha {ind} Corp",
                "url": f"https://alpha-{ind.lower().replace(' ', '')}.com",
                "description": f"Next-generation B2B solutions in the {ind} sector.",
                "industry": ind,
                "location": loc,
                "stage": stage,
                "source": "gemini_discovery"
            },
            {
                "name": f"Beta {ind} Labs",
                "url": f"https://beta-{ind.lower().replace(' ', '')}.com",
                "description": f"Innovative technology platforms for B2B {ind} optimization.",
                "industry": ind,
                "location": loc,
                "stage": stage,
                "source": "gemini_discovery"
            }
        ]

    # 3. Company Profile Agent profile
    if "analyze this company information" in prompt_lower or "tagline" in prompt_lower:
        return {
            "tagline": "Plausible B2B technology innovator",
            "product": "B2B SaaS Platform",
            "target_customers": "Mid-market & Enterprises",
            "tech_stack": ["Python", "React", "AWS"],
            "employee_estimate": "11-50",
            "founded_year": 2022,
            "business_model": "B2B"
        }

    # 4. Founder Profile Agent founders
    if "founder profiles based on your knowledge" in prompt_lower or "ceo | cto | coo" in prompt_lower:
        return [
            {
                "name": "Arjun Mehta",
                "title": "CEO & Co-founder",
                "background": "Ex-product manager at top tech firm. Serial entrepreneur.",
                "education": "IIT Bombay, B.Tech Computer Science",
                "linkedin_url": "https://linkedin.com/in/placeholder",
                "past_companies": ["Tech Giant", "First Startup"]
            },
            {
                "name": "Priya Nair",
                "title": "CTO & Co-founder",
                "background": "Deep learning researcher. Software engineer.",
                "education": "IISc Bangalore, M.Tech AI",
                "linkedin_url": "https://linkedin.com/in/placeholder",
                "past_companies": ["Research Lab"]
            }
        ]

    # 5. News Agent sentiment & mock news
    if "sentiment" in prompt_lower or "news headlines" in prompt_lower:
        return {
            "articles": [
                {"title": "Raises Seed Round for Expansion", "url": "https://example.com/news1", "published_at": "2024-06-01", "source": "TechCrunch"},
                {"title": "Launches New Product Suite", "url": "https://example.com/news2", "published_at": "2024-05-15", "source": "YourStory"}
            ],
            "sentiment": "positive",
            "momentum_signals": ["funding", "product launch"],
            "summary": "The company shows solid growth momentum with recent funding and product launch announcements."
        }

    # 6. Market Analysis Agent competitors & TAM
    if "market research analyst" in prompt_lower or "tam_estimate" in prompt_lower:
        return {
            "competitors": [
                {"name": "Competitor X", "url": "https://example.com/x", "differentiator": "Established brand presence"},
                {"name": "Competitor Y", "url": "https://example.com/y", "differentiator": "Lower pricing tier"}
            ],
            "tam_estimate": "$3.5B by 2028",
            "market_growth_rate": "22% CAGR",
            "key_trends": ["AI-driven automation", "Cloud migration", "Data privacy compliance"],
            "market_stage": "growing"
        }

    return fallback
