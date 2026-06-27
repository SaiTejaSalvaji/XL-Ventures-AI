import os
from dotenv import load_dotenv

load_dotenv()

# App settings
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Database settings
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./prospect_pilot.db")

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

# Mode helpers
def is_live_mode() -> bool:
    return bool(OPENAI_API_KEY)
