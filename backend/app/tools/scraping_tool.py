"""Web scraping wrapper using BeautifulSoup."""

import requests
from bs4 import BeautifulSoup


def scrape_website(url: str, timeout: int = 8, max_chars: int = 800) -> str:
    if not url:
        return ""
    try:
        resp = requests.get(
            url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"}
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        meta = soup.find("meta", attrs={"name": "description"})
        meta_text = meta["content"] if meta and meta.get("content") else ""
        body_text = " ".join(soup.get_text().split())[:max_chars]
        return f"{meta_text}\n{body_text}"
    except Exception:
        return ""
