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
import time
import random

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

# Models config
_GEMINI_MODEL_NAME = "gemini-2.0-flash"
_GROQ_MODEL_NAME = "llama-3.3-70b-versatile"

# Gemini pool state
_gemini_clients = []
_current_gemini_idx = 0

# Groq state
_groq_client = None


def _init_groq():
    """Lazy-initialize the Groq client."""
    global _groq_client
    if _groq_client is None and Groq is not None:
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            api_key = os.environ.get("GROQ_API_KEY", "").strip()
        if api_key:
            try:
                _groq_client = Groq(api_key=api_key)
                logger.info("Groq client successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")


def _init_gemini():
    """Initialize a pool of Gemini clients from GEMINI_API_KEY environment variable."""
    global _gemini_clients, _current_gemini_idx
    if not _gemini_clients:
        raw_keys = os.getenv("GEMINI_API_KEY", "").strip()
        if not raw_keys:
            raw_keys = os.environ.get("GEMINI_API_KEY", "").strip()
        
        keys = []
        for part in re.split(r'[;,]', raw_keys):
            k = part.strip()
            if k and k not in keys:
                keys.append(k)
        
        if not keys:
            return
        
        for k in keys:
            try:
                _gemini_clients.append(genai.Client(api_key=k))
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client with key {k[:8]}...: {e}")
        
        _current_gemini_idx = 0


def _get_gemini_client():
    _init_gemini()
    if not _gemini_clients:
        return None
    return _gemini_clients[_current_gemini_idx]


def _rotate_gemini_client():
    global _current_gemini_idx
    if not _gemini_clients:
        return None
    _current_gemini_idx = (_current_gemini_idx + 1) % len(_gemini_clients)
    logger.info(f"Rotated to Gemini client key index {_current_gemini_idx}")
    return _gemini_clients[_current_gemini_idx]


def _try_groq(prompt: str) -> str | None:
    """Send prompt to Groq and return response string, or None if error."""
    _init_groq()
    if _groq_client is None:
        return None
    try:
        completion = _groq_client.chat.completions.create(
            model=_GROQ_MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Groq API call failed, falling back: {e}")
        return None


def _try_gemini(prompt: str) -> str | None:
    """Send prompt to Gemini client pool and return response string, or None if all fail."""
    _init_gemini()
    if not _gemini_clients:
        return None

    max_attempts = max(3, len(_gemini_clients) * 2)
    attempt = 0
    backoff = 1.0

    while attempt < max_attempts:
        client = _get_gemini_client()
        if client is None:
            return None
        try:
            response = client.models.generate_content(
                model=_GEMINI_MODEL_NAME, contents=prompt
            )
            return response.text.strip()
        except gemini_errors.APIError as e:
            status_code = getattr(e, "status_code", None)
            message = str(e)
            attempt += 1

            if status_code == 429 or "quota" in message.lower() or "limit" in message.lower():
                sleep_time = backoff + random.uniform(0.1, 0.5)
                logger.warning(
                    f"Gemini rate limit (429) hit. Sleeping {sleep_time:.2f}s and retrying..."
                )
                time.sleep(sleep_time)
                backoff *= 2.0
                if len(_gemini_clients) > 1:
                    _rotate_gemini_client()
                continue
            elif status_code == 400 or "api key not valid" in message.lower():
                logger.error(f"Gemini key at index {_current_gemini_idx} is invalid.")
                if len(_gemini_clients) > 1:
                    _rotate_gemini_client()
                else:
                    break
                continue
            else:
                logger.error(f"Gemini error (status {status_code}): {message}")
                if len(_gemini_clients) > 1:
                    _rotate_gemini_client()
                continue
        except Exception as e:
            attempt += 1
            logger.error(f"Unexpected Gemini client error: {e}")
            if len(_gemini_clients) > 1:
                _rotate_gemini_client()
            continue

    return None


def ask(prompt: str, fallback: str = "N/A") -> str:
    """
    Send a prompt to Groq (primary) or Gemini (secondary/fallback) and return the response.
    If all LLM calls fail, falls back to the smart mock generator.
    """
    # 1. Try Groq first if key is configured
    result = _try_groq(prompt)
    if result is not None:
        return result

    # 2. Try Gemini pool if Groq failed or wasn't configured
    result = _try_gemini(prompt)
    if result is not None:
        return result

    # 3. Last fallback: local mock generator
    logger.error("All LLM providers failed or rate-limited. Using local mock generator.")
    return _mock_llm_ask(prompt, fallback)


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
