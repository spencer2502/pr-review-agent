from fastapi import APIRouter, HTTPException
from routes.github_routes import analyses_storage  # share in-memory storage

router = APIRouter()

@router.get("/analysis/demo/{demo_id}")
async def get_demo_analysis(demo_id: str):
    """Retrieve a stored analysis by ID"""
    analysis = analyses_storage.get(demo_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
