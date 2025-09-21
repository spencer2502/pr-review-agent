import httpx
import logging
from typing import Dict, Optional
from config import settings

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.base_token = settings.GITHUB_TOKEN
    
    def _get_headers(self, custom_token: Optional[str] = None) -> Dict[str, str]:
        """Get headers with appropriate token"""
        token = custom_token or self.base_token
        return {
            "Authorization": f"token {token}" if token else "",
            "Accept": "application/vnd.github.v3+json"
        }
    
    async def get_pr_data(self, repo: str, pr_number: int, github_token: Optional[str] = None) -> Dict:
        """Fetch PR data from GitHub API with optional custom token"""
        headers = self._get_headers(github_token)
        
        try:
            async with httpx.AsyncClient() as client:
                # Get PR details
                pr_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
                pr_response = await client.get(pr_url, headers=headers, timeout=10.0)
                
                if pr_response.status_code == 401:
                    logger.error("GitHub API authentication failed - invalid token")
                    raise Exception("Invalid GitHub token provided")
                elif pr_response.status_code == 403:
                    logger.error("GitHub API rate limit exceeded or insufficient permissions")
                    raise Exception("GitHub API rate limit exceeded or insufficient permissions")
                elif pr_response.status_code == 404:
                    logger.error(f"PR not found: {repo}/pulls/{pr_number}")
                    raise Exception(f"PR #{pr_number} not found in repository {repo}")
                elif pr_response.status_code != 200:
                    logger.error(f"Failed to fetch PR: {pr_response.status_code}")
                    raise Exception(f"GitHub API error: {pr_response.status_code}")
                
                pr_data = pr_response.json()
                
                # Get files changed
                files_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
                files_response = await client.get(files_url, headers=headers, timeout=10.0)
                
                files = files_response.json() if files_response.status_code == 200 else []
                
                return {
                    "title": pr_data.get("title", "Unknown PR"),
                    "description": pr_data.get("body", ""),
                    "files": files,
                    "additions": pr_data.get("additions", 0),
                    "deletions": pr_data.get("deletions", 0),
                    "changed_files": pr_data.get("changed_files", 0),
                    "state": pr_data.get("state", "open"),
                    "author": pr_data.get("user", {}).get("login", "unknown"),
                    "created_at": pr_data.get("created_at"),
                    "repository": repo,
                    "authenticated": bool(github_token or self.base_token)
                }
                
        except httpx.TimeoutException:
            logger.error("GitHub API request timed out")
            raise Exception("GitHub API request timed out")
        except Exception as e:
            logger.error(f"GitHub API error: {e}")
            raise e