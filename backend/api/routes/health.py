# backend/api/routes/health.py
from fastapi import APIRouter
from datetime import datetime
from config import settings
import httpx

router = APIRouter()

@router.get("/")
async def health_check():
    github_status = {"ok": True, "error": "No token configured - public repos only"}
    gemini_status = {"ok": False, "error": None}

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

    # Check Google Gemini API
    if settings.has_gemini_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={settings.GEMINI_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [
                            {
                                "parts": [{"text": "Health check test"}]
                            }
                        ],
                        "generationConfig": {
                            "maxOutputTokens": 1,
                            "temperature": 0.1
                        }
                    }
                )
                
                if resp.status_code == 200:
                    gemini_status = {"ok": True, "error": None}
                else:
                    gemini_status = {
                        "ok": False,
                        "error": f"HTTP {resp.status_code}: {resp.text[:100]}"
                    }
                    
        except Exception as e:
            gemini_status = {"ok": False, "error": f"Connection error: {str(e)}"}
    else:
        gemini_status = {"ok": False, "error": "No GEMINI_API_KEY configured"}

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "github_api": github_status,
            "gemini_api": gemini_status
        }
    }