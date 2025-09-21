# backend/app/api/routes/health.py
from fastapi import APIRouter
from datetime import datetime
from app.config import settings
import httpx

router = APIRouter()

# backend/app/api/routes/health.py
@router.get("/")
async def health_check():
    github_status = {"ok": True, "error": "No token configured - public repos only"}
    groq_status = {"ok": False, "error": None}

    # Only check GitHub API if token is available
    if settings.has_github_token:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"token {settings.GITHUB_TOKEN}"}
                )
                github_status["ok"] = resp.status_code == 200
                if not github_status["ok"]:
                    github_status["error"] = f"{resp.status_code}: {resp.text}"
        except Exception as e:
            github_status["error"] = str(e)

    # Check Groq API (your existing code)
    # ...

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "github_api": github_status,
            "groq_api": groq_status
        }
    }