from fastapi import APIRouter
from datetime import datetime
from app.config import settings

router = APIRouter()

@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "github_api": settings.has_github_token,
            "openai_api": settings.has_openai_key
        }
    }