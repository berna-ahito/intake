import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Intake API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./intake.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOCAL_DEV_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")

    @staticmethod
    def _parse_origins(value: str) -> list[str]:
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    @property
    def cors_origins(self) -> list[str]:
        origins: list[str] = []
        if self.ENVIRONMENT.lower() != "production":
            origins.extend(self._parse_origins(self.LOCAL_DEV_CORS_ORIGINS))
        origins.extend(self._parse_origins(self.CORS_ORIGINS))
        return list(dict.fromkeys(origins))


settings = Settings()
