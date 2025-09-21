import os
from typing import List

# Don't load .env here to avoid issues - it's loaded in main.py

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PR Review Agent"

    # External APIs - use get() to avoid KeyError
    GITHUB_TOKEN: str = os.environ.get("GITHUB_TOKEN", "")
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

    # CORS - Railway needs broader CORS for deployment
    ALLOWED_ORIGINS: List[str] = os.environ.get(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:5173,https://*.railway.app"
    ).split(",")

    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")

    @property
    def has_github_token(self) -> bool:
        return bool(self.GITHUB_TOKEN)
    
    @property
    def has_gemini_key(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()

# Debug prints - only in development
if os.environ.get("DEBUG", "").lower() in ["true", "1", "yes"]:
    print(f"GEMINI_API_KEY loaded: {bool(settings.GEMINI_API_KEY)}")
    print(f"GITHUB_TOKEN loaded: {bool(settings.GITHUB_TOKEN)}")
    print(f"ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")
else:
    # Production logging
    print(f"Config loaded - APIs: Gemini={bool(settings.GEMINI_API_KEY)}, GitHub={bool(settings.GITHUB_TOKEN)}")