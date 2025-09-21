from fastapi import APIRouter, HTTPException
from app.services.github_service import GitHubService
from app.services.analysis_service import AnalysisService
from app.models.github import PRRequest
from app.models.analysis import AnalysisResponse

router = APIRouter()
github_service = GitHubService()
analysis_service = AnalysisService()

# Storage
analyses_storage = {}

@router.post("/analyze-pr", response_model=AnalysisResponse)
async def analyze_github_pr(pr_request: PRRequest):
    """Analyze PR directly from GitHub repository"""
    try:
        # Fetch PR data from GitHub
        pr_data = await github_service.get_pr_data(
            pr_request.repository, 
            pr_request.pr_number
        )
        
        # Analyze the PR
        pr_id = f"{pr_request.repository}-{pr_request.pr_number}"
        analysis = await analysis_service.analyze_pr(pr_id, pr_data, pr_request.repository)
        
        # Store analysis
        analyses_storage[pr_id] = analysis
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub PR analysis failed: {str(e)}")
