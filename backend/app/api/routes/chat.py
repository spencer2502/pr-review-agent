from fastapi import APIRouter, HTTPException
from app.services.chat_service import ChatService
from app.models.chat import ChatRequest, ChatResponse
from datetime import datetime

router = APIRouter()
chat_service = ChatService()

# Storage
chat_history = {}

@router.post("/{pr_id:path}", response_model=ChatResponse)
async def chat_with_ai(pr_id: str, request: ChatRequest):
    """Chat with AI about specific PR"""
    try:
        # Get PR context
        from app.api.routes.analysis import analyses_storage
        from app.api.routes.github import analyses_storage as github_analyses_storage
        
        # Check both storages
        pr_context = analyses_storage.get(pr_id) or github_analyses_storage.get(pr_id)
        if not pr_context:
            pr_context = {}
        
        # Convert to dict if it's a Pydantic model
        if hasattr(pr_context, 'dict'):
            pr_context = pr_context.dict()
        
        # Generate AI response
        response = await chat_service.generate_response(
            request.content,
            request.mentor_mode,
            pr_context
        )
        
        # Store chat history
        if pr_id not in chat_history:
            chat_history[pr_id] = []
        
        chat_history[pr_id].append({
            "user": request.content,
            "ai": response.response,
            "mentor": request.mentor_mode,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/history/{pr_id}")
async def get_chat_history(pr_id: str):
    """Get chat history for a PR"""
    return chat_history.get(pr_id, [])