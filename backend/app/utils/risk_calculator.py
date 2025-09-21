import random
from typing import Dict

class RiskCalculator:
    def calculate_risk(self, pr_data: Dict) -> float:
        """Calculate risk score based on PR characteristics"""
        base_score = 30
        
        # File count impact
        file_count = pr_data.get("changed_files", 0)
        if file_count > 10:
            base_score += 25
        elif file_count > 5:
            base_score += 15
        
        # Size impact
        additions = pr_data.get("additions", 0)
        if additions > 500:
            base_score += 20
        elif additions > 200:
            base_score += 10
        
        # Security patterns in file names
        files = pr_data.get("files", [])
        security_keywords = ["auth", "login", "password", "token", "admin"]
        for file_info in files:
            filename = file_info.get("filename", "").lower()
            if any(keyword in filename for keyword in security_keywords):
                base_score += 15
                break
        
        return min(100, base_score + random.randint(0, 20))