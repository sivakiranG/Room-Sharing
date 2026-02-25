from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/grocery_tracker"
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    # For development we default to allowing everything — the middleware below
    # actually uses this value, so setting it to ['*'] lets any origin pass
    # through. In production you can lock this down to a specific list.
    CORS_ORIGINS: List[str] = ["*"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
