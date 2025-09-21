from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
from datetime import datetime

# Load .env before anything else
load_dotenv()

from api.routes import analysis, chat, github, health
from config import settings

app = FastAPI(
    title="PR Review Agent API",
    version="2.0.0",
    description="AI-powered Pull Request Review with GitHub integration"
)

# Allowed frontend origins
origins = [
    "https://pr-review-agent-ffy5.vercel.app",
    "http://localhost:3000",  # for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(github.router, prefix="/api/github", tags=["github"])

# In-memory storage for demo PRs
analyses_storage = {}

def seed_demo_data():
    """Seed demo PR #123 and sample repo-based PRs."""
    analyses_storage["123"] = {
        "pr_id": "123",
        "title": "Add user authentication system",
        "repository": "demo/repo",
        "issues": [
            {
                "file": "auth.py",
                "line": 42,
                "type": "Security",
                "severity": "high",
                "description": "Password stored in plaintext",
                "fix_suggestion": "Use hashed passwords",
                "code": "password = '1234'"
            }
        ],
        "auto_fixes": [
            {
                "id": 1,
                "description": "Hash passwords",
                "confidence": 0.9,
                "diff": "+ hashed_password = hash(password)\n- password = '1234'",
                "applied": False
            }
        ],
        "risk_score": 85,
        "risk_level": "red",
        "created_at": datetime.now().isoformat(),
        "analysis_time": 2.4,
        "time_machine": {
            "bug_likelihood": 0.3,
            "maintainability_impact": -15,
            "performance_regression": 0.08,
            "predicted_issues": [
                "Auth system may expose sessions without validation",
                "DB queries could create bottlenecks"
            ]
        }
    }

    # Sample repo-based PR
    analyses_storage["facebook/react-24652"] = {
        **analyses_storage["123"],
        "pr_id": "facebook/react-24652",
        "repository": "facebook/react",
        "title": "Fix React bug #24652"
    }

seed_demo_data()

@app.get("/api/analysis/demo/{pr_id}")
async def get_demo_data(pr_id: str):
    pr_data = analyses_storage.get(pr_id)
    if not pr_data:
        return {"error": "Demo PR not found"}, 404
    return pr_data

@app.get("/")
async def root():
    return {
        "message": "PR Review Agent API v2.0",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
