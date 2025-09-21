from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Load .env before anything else
load_dotenv()

from api.routes import analysis, chat, github, health
from config import settings

app = FastAPI(
    title="PR Review Agent API",
    version="2.0.0",
    description="AI-powered Pull Request Review with GitHub integration"
)

    
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(github.router, prefix="/api/github", tags=["github"])

@app.get("/")
async def root():
    return {
        "message": "PR Review Agent API v2.0",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    # For Railway deployment, use the PORT environment variable
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",  # Important: bind to all interfaces for Railway
        port=port,
        log_level="info"
    )