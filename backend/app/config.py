from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://timebank_user:timebank_pass@localhost:3306/timebank_db"
    JWT_SECRET_KEY: str = "timebank-super-secret-jwt-signing-key-for-local-development-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_NAME: str = "access_token"
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
