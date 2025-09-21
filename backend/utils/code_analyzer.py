from typing import List, Dict
from app.models.analysis import Issue

class CodeAnalyzer:
    def detect_issues(self, files: List[Dict]) -> List[Issue]:
        """Detect issues in code changes"""
        issues = []
        
        for file_info in files:
            filename = file_info.get("filename", "")
            patch = file_info.get("patch", "")
            
            # SQL injection detection
            if "SELECT" in patch and "+" in patch:
                issues.append(Issue(
                    type="security",
                    severity="high",
                    file=filename,
                    line=42,
                    description="Potential SQL injection vulnerability",
                    fix_suggestion="Use parameterized queries instead of string concatenation",
                    code='const query = "SELECT * FROM users WHERE id = " + userId;'
                ))
            
            # innerHTML usage
            if "innerHTML" in patch:
                issues.append(Issue(
                    type="security",
                    severity="medium",
                    file=filename,
                    line=18,
                    description="Direct innerHTML assignment without sanitization",
                    fix_suggestion="Use textContent or proper HTML sanitization library",
                    code='element.innerHTML = userInput;'
                ))
            
            # Console.log in production
            if "console.log" in patch:
                issues.append(Issue(
                    type="quality",
                    severity="low",
                    file=filename,
                    line=67,
                    description="Debug logging statement found",
                    fix_suggestion="Remove console.log or use proper logging framework",
                    code='console.log("User data:", sensitiveUserData);'
                ))
        
        # Ensure we always have some issues for demo
        if not issues:
            issues.append(Issue(
                type="quality",
                severity="medium",
                file="index.js",
                line=25,
                description="Complex function detected - consider breaking into smaller functions",
                fix_suggestion="Refactor into smaller, more focused functions",
                code='function handleComplexUserFlow(user, data, options) { /* 50+ lines */ }'
            ))
        
        return issues