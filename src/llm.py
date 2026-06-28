"""
llm.py — Gemini LLM Helper

Single shared entry point for all LLM calls in VenturePilot AI.
Uses google-genai SDK with gemini-1.5-flash (free tier).

Usage:
    from src.llm import ask, ask_json

    summary = ask("Summarize this company: Acme Corp builds AI tools.")
    data    = ask_json("Return JSON with keys name, score: company Acme Corp")
"""

import json
import os
import re
import logging
import requests
import time

from google import genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Gemini model — "gemini-flash-latest" is standard stable free-tier and fast
_MODEL_NAME = "gemini-flash-latest"
_client = None


def _get_client():
    """Lazy-initialize the Gemini client (avoids import-time API calls)."""
    global _client
    if _client is None:
        project = os.getenv("GCP_PROJECT", "").strip()
        location = os.getenv("GCP_LOCATION", "us-central1").strip()
        api_key = os.getenv("GEMINI_API_KEY", "").strip()

        if project:
            logger.info(f"Initializing Vertex AI client (Project: {project}, Location: {location})")
            if api_key:
                _client = genai.Client(vertexai=True, project=project, location=location, api_key=api_key)
            else:
                _client = genai.Client(vertexai=True, project=project, location=location)
        else:
            if not api_key:
                logger.warning("GEMINI_API_KEY not set — LLM calls will return placeholder text.")
                return None
            _client = genai.Client(api_key=api_key)
    return _client


def ask(prompt: str, fallback: str = "N/A") -> str:
    """
    Send a prompt to Groq (if GROQ_API_KEY is configured) or Gemini.

    Args:
        prompt:   The prompt string.
        fallback: Value returned if the LLMs are unavailable or error out.

    Returns:
        str: Response text, or fallback on error.
    """
    # ── Try Groq First ──
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        max_retries = 3
        delay = 2.0
        for attempt in range(max_retries):
            try:
                resp = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": groq_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    },
                    timeout=15,
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
                elif resp.status_code in (429, 503):
                    sleep_time = delay * (2 ** attempt)
                    logger.warning(f"Groq API rate limit (status {resp.status_code}) hit. Retrying in {sleep_time:.1f}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                else:
                    logger.error(f"Groq API error {resp.status_code}: {resp.text}")
                    break
            except Exception as e:
                logger.warning(f"Groq exception: {e}. Retrying in {delay}s...")
                time.sleep(delay)
                continue
        logger.warning("Groq calls failed or rate-limited. Falling back to Gemini...")

    # ── Fallback to Gemini ──
    client = _get_client()
    if client is None:
        return fallback

    max_retries = 3
    delay = 2.0
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=_MODEL_NAME, contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            err_msg = str(e)
            # Check for rate limits (429) or temporary server overload (503)
            if attempt < max_retries - 1 and ("429" in err_msg or "503" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "UNAVAILABLE" in err_msg):
                sleep_time = delay * (2 ** attempt)
                logger.warning(f"Gemini API rate limit or 503 hit. Retrying in {sleep_time:.1f}s... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(sleep_time)
                continue
            
            logger.error(f"Gemini error: {e}")
            return fallback


def ask_json(prompt: str, fallback: dict | None = None) -> dict:
    """
    Send a prompt to Gemini expecting a JSON response.
    Automatically strips markdown code fences if present.

    Args:
        prompt:   Prompt that instructs Gemini to return JSON.
        fallback: Dict returned if parsing fails.

    Returns:
        dict: Parsed JSON from Gemini, or fallback on error.
    """
    if fallback is None:
        fallback = {}

    raw = ask(prompt, fallback="")
    if not raw:
        return fallback

    # Strip ```json ... ``` fences
    raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning(f"Gemini returned non-JSON: {raw[:200]}")
        return fallback
