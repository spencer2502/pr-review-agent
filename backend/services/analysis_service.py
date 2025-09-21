import asyncio
import random
from datetime import datetime
from typing import List, Dict
from app.models.analysis import Issue, AutoFix, TimeachineData, AnalysisResponse
from app.utils.risk_calculator import RiskCalculator
from app.utils.code_analyzer import CodeAnalyzer

class AnalysisService:
    def __init__(self):
        self.risk_calculator = RiskCalculator()
        self.code_analyzer = CodeAnalyzer()
    
    async def analyze_pr(self, pr_id: str, pr_data: Dict, repository: str = "") -> AnalysisResponse:
        """Main PR analysis orchestrator"""
        analysis_start = datetime.now()
        
        # Simulate analysis time
        await asyncio.sleep(1.5)
        
        # Calculate risk score
        risk_score = self.risk_calculator.calculate_risk(pr_data)
        risk_level = self._get_risk_level(risk_score)
        
        # Analyze code issues
        issues = self.code_analyzer.detect_issues(pr_data.get("files", []))
        
        # Generate auto-fixes
        auto_fixes = self._generate_auto_fixes(issues)
        
        # Generate time machine predictions
        time_machine = self._generate_time_machine_predictions(pr_data, risk_score)
        
        analysis_duration = (datetime.now() - analysis_start).total_seconds()
        
        return AnalysisResponse(
            pr_id=pr_id,
            title=pr_data.get("title", "Unknown PR"),
            repository=repository,
            risk_score=risk_score,
            risk_level=risk_level,
            time_machine=time_machine,
            issues=issues,
            auto_fixes=auto_fixes,
            analysis_time=analysis_duration
        )
    
    def _get_risk_level(self, risk_score: float) -> str:
        if risk_score < 50:
            return "green"
        elif risk_score < 75:
            return "yellow"
        else:
            return "red"
    
    def _generate_auto_fixes(self, issues: List[Issue]) -> List[AutoFix]:
        """Generate auto-fix patches for detected issues"""
        fixes = []
        
        for i, issue in enumerate(issues[:3]):
            fix_id = f"fix_{i+1:03d}"
            
            if "SQL injection" in issue.description:
                fixes.append(AutoFix(
                    id=fix_id,
                    description="Replace string concatenation with parameterized query",
                    diff="- const query = \"SELECT * FROM users WHERE id = \" + userId;\n+ const query = \"SELECT * FROM users WHERE id = ?\";\n+ const result = db.query(query, [userId]);",
                    confidence=0.95
                ))
            elif "innerHTML" in issue.description:
                fixes.append(AutoFix(
                    id=fix_id,
                    description="Replace innerHTML with textContent for safety",
                    diff="- element.innerHTML = userInput;\n+ element.textContent = userInput;",
                    confidence=0.88
                ))
            elif "console.log" in issue.description:
                fixes.append(AutoFix(
                    id=fix_id,
                    description="Remove debug console.log statement",
                    diff="- console.log(\"User data:\", sensitiveUserData);\n+ // Debug logging removed for production",
                    confidence=0.92
                ))
            else:
                fixes.append(AutoFix(
                    id=fix_id,
                    description=f"Auto-fix for {issue.description}",
                    diff=f"// Auto-generated fix for {issue.file}:{issue.line}\n+ // TODO: Implement specific fix",
                    confidence=0.75
                ))
        
        return fixes
    
    def _generate_time_machine_predictions(self, pr_data: Dict, risk_score: float) -> TimeachineData:
        """Generate Time Machine predictions"""
        bug_likelihood = min(0.45, risk_score / 200 + random.uniform(0.1, 0.15))
        maintainability_impact = -random.randint(5, 25) if risk_score > 60 else random.randint(5, 15)
        performance_regression = min(0.2, risk_score / 500 + random.uniform(0.02, 0.08))
        
        predicted_issues = [
            "Authentication bypass vulnerability may emerge in edge cases",
            "Database connection pooling issues under high load",
            "Memory leaks possible with unclosed event listeners",
            "Race conditions in concurrent authentication requests"
        ]
        
        if pr_data.get("changed_files", 0) > 5:
            predicted_issues.append("Increased coupling between modules may reduce maintainability")
        
        return TimeachineData(
            bug_likelihood=bug_likelihood,
            maintainability_impact=maintainability_impact,
            performance_regression=performance_regression,
            predicted_issues=predicted_issues[:4]
        )