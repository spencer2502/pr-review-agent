from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
# from app.api.routes import analysis, chat, github, health
from app.config import settings

app = FastAPI(
    title="PR Review Agent API",
    version="2.0.0",
    description="AI-powered Pull Request Review with GitHub integration"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(health.router, prefix="/health", tags=["health"])
# app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
# app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
# app.include_router(github.router, prefix="/api/github", tags=["github"])

@app.get("/")
async def root():
    return {
        "message": "PR Review Agent API v2.0",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )
