"""Google Custom Search API wrapper."""

import logging
import requests

logger = logging.getLogger(__name__)


def google_cse_search(
    query: str, api_key: str, cse_id: str, num: int = 10, timeout: int = 10
) -> list[dict]:
    if not api_key:
        logger.warning("GOOGLE_CSE_API_KEY not set — CSE search unavailable")
        return []
    if not cse_id:
        logger.warning(
            "GOOGLE_CSE_ID not set — create a Programmable Search Engine at "
            "https://programmablesearchengine.google.com/ to enable CSE search"
        )
        return []
    try:
        resp = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={"key": api_key, "cx": cse_id, "q": query, "num": num},
            timeout=timeout,
        )
        items = resp.json().get("items", [])
        return [
            {
                "title": item.get("title", "").split(" - ")[0].strip(),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
            }
            for item in items
            if item.get("link", "").startswith("http")
        ]
    except Exception as e:
        logger.warning(f"Google CSE request failed: {e}")
        return []
