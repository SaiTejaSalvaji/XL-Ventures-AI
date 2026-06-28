"""
VenturePilot AI — Tools Package

External API wrapper modules. Each tool is a thin, stateless wrapper
around a single external service. Agents import these directly.

Tools implemented across stages:
  - search_tool.py          (Stage 5) : Google Custom Search API
  - opencorporates_tool.py  (Stage 5) : Company registry validation
  - scraping_tool.py        (Stage 6) : BeautifulSoup web scraper
  - news_tool.py            (Stage 7) : NewsAPI.org wrapper
  - hunter_tool.py          (Stage 8) : Hunter.io email lookup

Stage 1: Package stub only.
"""
