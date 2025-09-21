# backend/app/api/routes/health.py
from fastapi import APIRouter
from datetime import datetime
from app.config import settings
import httpx

router = APIRouter()

@router.get("/")
async def health_check():
    github_status = {"ok": False, "error": None}
    groq_status = {"ok": False, "error": None}

    # ✅ Check GitHub API
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

    # ✅ Check Groq API
    if settings.has_groq_key:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
    "https://api.groq.com/openai/v1/models",
    headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
)

                groq_status["ok"] = resp.status_code == 200
                if not groq_status["ok"]:
                    groq_status["error"] = f"{resp.status_code}: {resp.text}"
        except Exception as e:
            groq_status["error"] = str(e)

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "github_api": github_status,
            "groq_api": groq_status
        }
    }
