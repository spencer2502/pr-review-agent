from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Load .env before anything else
load_dotenv()

# Import after loading env vars to avoid import errors
try:
    from api.routes import analysis, chat, github, health
    from config import settings
except ImportError as e:
    print(f"Import error: {e}")
    # Create minimal settings if import fails
    class Settings:
        ALLOWED_ORIGINS = ["*"]  # Allow all origins for now
    settings = Settings()

app = FastAPI(
    title="PR Review Agent API",
    version="2.0.0",
    description="AI-powered Pull Request Review with GitHub integration"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=getattr(settings, 'ALLOWED_ORIGINS', ["*"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (always available)
@app.get("/")
async def root():
    return {
        "message": "PR Review Agent API v2.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "port": os.getenv("PORT", "unknown")}

# Include routers if they were imported successfully
try:
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
    app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
    app.include_router(github.router, prefix="/api/github", tags=["github"])
    print("All routers loaded successfully")
except NameError:
    print("Warning: Some routers not loaded due to import errors")

# For Railway deployment - this is crucial
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(
        "main:app",  # Use string reference instead of app object
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )