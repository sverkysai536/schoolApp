from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
