from fastapi import APIRouter, HTTPException
from services.analysis_service import AnalysisService
from models.analysis import AnalysisResponse

router = APIRouter()
analysis_service = AnalysisService()

# In-memory storage for demo
analyses_storage = {}

@router.post("/pr/{pr_id}", response_model=AnalysisResponse)
async def analyze_pr(pr_id: str, title: str = "Add user authentication system"):
    """Analyze PR with mock data"""
    try:
        mock_data = {
            "title": title,
            "description": "Mock PR for demonstration",
            "files": [{"filename": "auth.js", "patch": "SELECT * FROM users WHERE id = " + userId}],
            "changed_files": 5,
            "additions": 100,
            "deletions": 20
        }
        
        analysis = await analysis_service.analyze_pr(pr_id, mock_data)
        analyses_storage[pr_id] = analysis
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/pr/{pr_id}", response_model=AnalysisResponse)
async def get_analysis(pr_id: str):
    """Get existing analysis"""
    if pr_id not in analyses_storage:
        return await analyze_pr(pr_id)
    return analyses_storage[pr_id]

@router.post("/apply-fix/{pr_id}/{fix_id}")
async def apply_fix(pr_id: str, fix_id: str):
    """Apply auto-fix and update risk score"""
    try:
        if pr_id not in analyses_storage:
            raise HTTPException(status_code=404, detail="PR analysis not found")
        
        analysis = analyses_storage[pr_id]
        
        for fix in analysis.auto_fixes:
            if fix.id == fix_id:
                fix.applied = True
                reduction = int(15 * fix.confidence)
                analysis.risk_score = max(0, analysis.risk_score - reduction)
                analysis.risk_level = "green" if analysis.risk_score < 50 else "yellow" if analysis.risk_score < 75 else "red"
                
                return {
                    "success": True,
                    "message": f"Fix {fix_id} applied successfully",
                    "new_risk_score": analysis.risk_score,
                    "new_risk_level": analysis.risk_level
                }
        
        raise HTTPException(status_code=404, detail="Fix not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply fix: {str(e)}")
