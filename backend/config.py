import os
from typing import List
from dotenv import load_dotenv

# Load variables from .env into environment
load_dotenv()

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PR Review Agent"

    # External APIs
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")  # Only Gemini now

    # CORS
    ALLOWED_ORIGINS: List[str] = (
        os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    )

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    @property
    def has_github_token(self) -> bool:
        return bool(self.GITHUB_TOKEN)
    
    @property
    def has_gemini_key(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()

# Debug prints
print(f"GEMINI_API_KEY loaded: {bool(settings.GEMINI_API_KEY)}")
print(f"GITHUB_TOKEN loaded: {bool(settings.GITHUB_TOKEN)}")