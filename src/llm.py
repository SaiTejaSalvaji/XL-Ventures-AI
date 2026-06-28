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

from google import genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Gemini model — "gemini-2.0-flash" is free-tier and fast
_MODEL_NAME = "gemini-2.0-flash"
_client = None


def _get_client():
    """Lazy-initialize the Gemini client (avoids import-time API calls)."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
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
