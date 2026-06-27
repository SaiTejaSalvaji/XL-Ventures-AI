from typing import Optional
from dotenv import load_dotenv, find_dotenv
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', 
                                      env_file_encoding='utf-8',
                                      extra='allow')

    # API Settings
    PROJECT_NAME: str = "AI Investment Analysis Sample API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    API_SERVER_HOST: str = "0.0.0.0"
    API_SERVER_PORT: int = 8084
    API_SERVER_WORKERS: int = 1
    LOG_LEVEL:str = "DEBUG"
    
    # CORS Settings
    ALLOW_CREDENTIALS: bool = True
    ALLOW_ORIGINS: list[str] = ["*"]
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]

    # GCP Project Settings
    GCP_PROJECT_ID: str = ""
    GCP_LOCATION: str = "us-central1"

    # GCP Firestore Settings
    FIRESTORE_DATABASE_ID: str = "(default)"
    
    # GCP Storage Settings (GCS)
    GCS_BUCKET_NAME: str = ""

    # Vertex AI Gemini Settings
    GEMINI_MODEL_NAME: str = "gemini-1.5-pro"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

load_dotenv(find_dotenv('.env'))

settings: Settings = get_settings()

