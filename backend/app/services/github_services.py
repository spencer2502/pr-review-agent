import httpx
import logging
from typing import Dict, List
from app.config import settings

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.token = settings.GITHUB_TOKEN
        self.headers = {
            "Authorization": f"token {self.token}" if self.token else "",
            "Accept": "application/vnd.github.v3+json"
        }
    
    async def get_pr_data(self, repo: str, pr_number: int) -> Dict:
        """Fetch PR data from GitHub API"""
        try:
            async with httpx.AsyncClient() as client:
                # Get PR details
                pr_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
                pr_response = await client.get(pr_url, headers=self.headers, timeout=10.0)
                
                if pr_response.status_code != 200:
                    logger.error(f"Failed to fetch PR: {pr_response.status_code}")
                    return self._get_mock_pr_data(repo, pr_number)
                
                pr_data = pr_response.json()
                
                # Get files changed
                files_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
                files_response = await client.get(files_url, headers=self.headers, timeout=10.0)
                
                files = files_response.json() if files_response.status_code == 200 else []
                
                return {
                    "title": pr_data.get("title", "Unknown PR"),
                    "description": pr_data.get("body", ""),
                    "files": files,
                    "additions": pr_data.get("additions", 0),
                    "deletions": pr_data.get("deletions", 0),
                    "changed_files": pr_data.get("changed_files", 0),
                    "state": pr_data.get("state", "open"),
                    "author": pr_data.get("user", {}).get("login", "unknown")
                }
        except Exception as e:
            logger.error(f"GitHub API error: {e}")
            return self._get_mock_pr_data(repo, pr_number)
    
    def _get_mock_pr_data(self, repo: str, pr_number: int) -> Dict:
        """Fallback mock data when GitHub API is unavailable"""
        return {
            "title": "Add user authentication system",
            "description": "Implementing JWT-based authentication with user registration and login",
            "files": [
                {
                    "filename": "auth.js",
                    "patch": '''@@ -40,7 +40,7 @@
 function authenticateUser(userId) {
-    const query = "SELECT * FROM users WHERE id = " + userId;
+    const query = "SELECT * FROM users WHERE id = ?";
+    return db.query(query, [userId]);
 }''',
                    "additions": 2,
                    "deletions": 1
                }
            ],
            "additions": 45,
            "deletions": 12,
            "changed_files": 8,
            "state": "open",
            "author": "demo-user"
        }
