from fastapi import APIRouter, HTTPException
from services.github_service import GitHubService
from services.analysis_service import AnalysisService
from models.github import PRRequest
from models.analysis import AnalysisResponse

router = APIRouter()
github_service = GitHubService()
analysis_service = AnalysisService()

# In-memory storage
analyses_storage = {}

@router.post("/analyze-pr", response_model=AnalysisResponse)
async def analyze_github_pr(pr_request: PRRequest):
    """Analyze PR directly from GitHub repository"""
    try:
        if not pr_request.repository or "/" not in pr_request.repository:
            raise HTTPException(status_code=400, detail="Invalid repository format. Use 'owner/repo'")

        pr_data = await github_service.get_pr_data(
            pr_request.repository, 
            pr_request.pr_number,
            pr_request.github_token
        )

        pr_id = f"{pr_request.repository}-{pr_request.pr_number}"
        analysis = await analysis_service.analyze_pr(pr_id, pr_data, pr_request.repository)
        analysis.github_authenticated = bool(pr_request.github_token)

        analyses_storage[pr_id] = analysis
        return analysis

    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        if "Invalid GitHub token" in error_message:
            raise HTTPException(status_code=401, detail="Invalid GitHub token provided.")
        elif "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded.")
        elif "not found" in error_message:
            raise HTTPException(status_code=404, detail=error_message)
        else:
            raise HTTPException(status_code=500, detail=f"GitHub PR analysis failed: {error_message}")

@router.post("/validate-token")
async def validate_github_token(request: dict):
    """Validate a GitHub token"""
    token = request.get("token", "")
    if not token:
        return {"valid": False, "error": "No token provided"}

    import httpx
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {token}"}
            )
            if resp.status_code == 200:
                user_data = resp.json()
                return {
                    "valid": True,
                    "user": user_data.get("login"),
                    "rate_limit": resp.headers.get("X-RateLimit-Remaining", "unknown"),
                    "scopes": resp.headers.get("X-OAuth-Scopes", "unknown")
                }
            else:
                return {"valid": False, "error": "Invalid token"}
    except Exception as e:
        return {"valid": False, "error": str(e)}
