from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    content: str
    mentor_mode: str = "balanced"

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    mentor_name: str

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    timestamp: datetime
    mentor_name: Optional[str] = None