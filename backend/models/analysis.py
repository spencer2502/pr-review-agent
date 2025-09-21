from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Issue(BaseModel):
    type: str
    severity: str
    file: str
    line: int
    description: str
    fix_suggestion: str
    code: Optional[str] = ""

class AutoFix(BaseModel):
    id: str
    description: str
    diff: str
    confidence: float
    applied: bool = False

class TimeachineData(BaseModel):
    bug_likelihood: float
    maintainability_impact: int
    performance_regression: float
    predicted_issues: List[str]

class AnalysisResponse(BaseModel):
    pr_id: str
    title: str
    repository: Optional[str] = ""
    risk_score: float
    risk_level: str
    time_machine: TimeachineData
    issues: List[Issue]
    auto_fixes: List[AutoFix]
    analysis_time: float
    github_authenticated: Optional[bool] = False
    created_at: datetime = datetime.utcnow()