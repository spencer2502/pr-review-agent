from pydantic import BaseModel
from typing import Optional

class PRRequest(BaseModel):
    pr_url: str
    repository: str
    pr_number: int
    title: Optional[str] = ""
    github_token: Optional[str] = None

class GitHubFile(BaseModel):
    filename: str
    patch: Optional[str] = ""
    additions: int = 0
    deletions: int = 0
    status: str = "modified"