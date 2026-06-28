"""
news_agent.py — News Agent
Fetches recent news via NewsAPI and uses Gemini for sentiment analysis.
Falls back to Gemini-generated mock news when NewsAPI key is unavailable.
"""

import os
import requests
from src.agents.base_agent import BaseAgent
from src.llm import ask, ask_json


class NewsAgent(BaseAgent):
    name = "news"
    description = "Fetches company news from NewsAPI and classifies sentiment with Gemini."

    def run(self, company: dict | None = None, **kwargs) -> dict:
        company = company or {}
        self.log_start({"company": company.get("name")})

        name = company.get("name", "")
        articles = self._fetch_news(name)

        if articles:
            sentiment_data = self._gemini_sentiment(name, articles)
        else:
            sentiment_data = self._gemini_mock_news(name, company)

        self.log_done(f"News: {len(articles)} articles, sentiment={sentiment_data.get('sentiment')}")
        return sentiment_data

    def _fetch_news(self, company_name: str) -> list[dict]:
        api_key = os.getenv("NEWSAPI_KEY", "")
        if not api_key:
            return []
        try:
            resp = requests.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": company_name,
                    "sortBy": "publishedAt",
                    "pageSize": 5,
                    "apiKey": api_key,
                },
                timeout=8,
            )
            articles = resp.json().get("articles", [])
            return [
                {
                    "title": a.get("title", ""),
                    "url": a.get("url", ""),
                    "published_at": a.get("publishedAt", ""),
                    "source": a.get("source", {}).get("name", ""),
                }
                for a in articles
                if a.get("title")
            ]
        except Exception as e:
            self.logger.warning(f"NewsAPI error: {e}")
            return []

    def _gemini_sentiment(self, company_name: str, articles: list[dict]) -> dict:
        titles = "\n".join(f"- {a['title']}" for a in articles[:5])
        prompt = f"""
Analyze these news headlines about {company_name} and return JSON:
{titles}

Return ONLY JSON:
{{
  "sentiment": "positive | neutral | negative",
  "momentum_signals": ["list of key signals like funding, growth, award"],
  "summary": "1-sentence summary of recent news"
}}
"""
        result = ask_json(prompt, fallback={
            "sentiment": "neutral", "momentum_signals": [], "summary": "No recent news."
        })
        result["articles"] = articles
        return result

    def _gemini_mock_news(self, company_name: str, company: dict) -> dict:
        industry = company.get("industry", "technology")
        prompt = f"""
Generate realistic mock news data for {company_name}, an {industry} startup in India.
Return ONLY JSON:
{{
  "articles": [
    {{"title": "headline", "url": "https://example.com", "published_at": "2024-06-01", "source": "TechCrunch"}},
    {{"title": "headline2", "url": "https://example.com/2", "published_at": "2024-05-15", "source": "YourStory"}}
  ],
  "sentiment": "positive | neutral | negative",
  "momentum_signals": ["funding", "product launch"],
  "summary": "1-sentence summary"
}}
"""
        return ask_json(prompt, fallback={
            "articles": [],
            "sentiment": "neutral",
            "momentum_signals": ["active in market"],
            "summary": f"{company_name} is an active startup in the {industry} space.",
        })
