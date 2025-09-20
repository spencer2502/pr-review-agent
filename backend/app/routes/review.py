from fastapi import APIRouter, Request
from app.services.ai_review import analyze_pr

router = APIRouter()

@router.post("/webhook")
async def github_webhook(request: Request):
    payload = await request.json()
    if payload.get("action") == "opened" and "pull_request" in payload:
        pr_url = payload["pull_request"]["html_url"]
        review_result = await analyze_pr(pr_url)
        return {"review": review_result}
    return {"msg": "Ignored"}
