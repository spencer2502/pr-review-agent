# backend/app/config.py
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
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.railway.app",
        "*"  # ⚠️ remove in prod
    ]
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    @property
    def has_github_token(self) -> bool:
        return bool(self.GITHUB_TOKEN)
    
    @property
    def has_groq_key(self) -> bool:
        return bool(self.GROQ_API_KEY)
    
    @property
    def has_openai_key(self) -> bool:
        return bool(self.OPENAI_API_KEY)

settings = Settings()
