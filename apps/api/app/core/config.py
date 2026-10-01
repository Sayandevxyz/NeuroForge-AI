import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "NeuroForge AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./neuroforge.db"
    
    # Redis
    REDIS_URL: Optional[str] = None

    # AI Provider (OpenAI, OpenRouter, Local, etc.)
    AI_PROVIDER: str = "demo"
    AI_API_KEY: Optional[str] = None
    AI_BASE_URL: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"

    # Compute & Nebius Cloud Infrastructure
    DEMO_MODE: bool = True
    GPU_PROVIDER: str = "demo"  # demo | nebius | local_nvidia
    NEBIUS_API_KEY: Optional[str] = None
    NEBIUS_PROJECT_ID: Optional[str] = None
    NEBIUS_CLUSTER_ID: Optional[str] = None
    NEBIUS_REGION: str = "eu-north1"

    # NVIDIA Acceleration Backend
    NVIDIA_BACKEND: str = "demo"  # demo | pytorch | tensorrt_llm | nemo

    # Web / CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]


settings = Settings()
