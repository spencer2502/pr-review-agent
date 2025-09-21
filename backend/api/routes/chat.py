# backend/api/routes/chat.py
from fastapi import APIRouter, HTTPException
from services.chat_service import ChatService
from models.chat import ChatRequest, ChatResponse
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
chat_service = ChatService()

# In-memory storage
chat_history = {}

@router.post("/{pr_id:path}", response_model=ChatResponse)
async def chat_with_ai(pr_id: str, request: ChatRequest):
    """Chat with AI about specific PR"""
    try:
        from api.routes.analysis import analyses_storage
        from api.routes.github import analyses_storage as github_analyses_storage

        # Lookup PR context
        pr_context = analyses_storage.get(pr_id) or github_analyses_storage.get(pr_id) or {}
        if hasattr(pr_context, "dict"):
            pr_context = pr_context.dict()

        # Generate AI response
        response = await chat_service.generate_response(
            request.content,
            request.mentor_mode,
            pr_context
        )

        # Save history
        chat_history.setdefault(pr_id, []).append({
            "user": request.content,
            "ai": response.response,
            "mentor": request.mentor_mode,
            "timestamp": datetime.utcnow().isoformat()
        })

        return response

    except Exception as e:
        logger.error(f"Chat route failed for PR {pr_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/history/{pr_id}")
async def get_chat_history(pr_id: str):
    """Fetch chat history for a PR"""
    return chat_history.get(pr_id, [])
