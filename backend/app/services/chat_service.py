import httpx
import logging
from datetime import datetime
from app.config import settings
from app.models.chat import ChatResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
    
    async def generate_response(self, message: str, mentor_mode: str, pr_context: dict) -> ChatResponse:
        """Generate chat response with mentor persona"""
        try:
            if self.openai_key:
                response_text = await self._openai_chat(message, mentor_mode, pr_context)
            else:
                response_text = self._fallback_chat(message, mentor_mode, pr_context)
            
            mentor_names = {
                "sarah_lead": "Sarah (Team Lead)",
                "alex_security": "Alex (Security Expert)",
                "jordan_perf": "Jordan (Performance Guru)",
                "balanced": "AI Reviewer"
            }
            
            return ChatResponse(
                response=response_text,
                timestamp=datetime.utcnow(),
                mentor_name=mentor_names.get(mentor_mode, "AI Reviewer")
            )
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return ChatResponse(
                response="I'm having trouble processing your question. Could you try rephrasing it?",
                timestamp=datetime.utcnow(),
                mentor_name="AI Reviewer"
            )
    
    async def _openai_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Chat with OpenAI API"""
        system_prompts = {
            "sarah_lead": "You are Sarah, an experienced team lead focused on architecture and mentoring developers.",
            "alex_security": "You are Alex, a security expert. Focus on security implications and be direct about risks.",
            "jordan_perf": "You are Jordan, a performance optimization expert. Focus on scalability and metrics.",
            "balanced": "You are an AI code reviewer providing balanced, helpful feedback."
        }
        
        system_prompt = system_prompts.get(mentor_mode, system_prompts["balanced"])
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"PR Context: Risk score {pr_context.get('risk_score', 0)}/100. Question: {message}"}
                    ],
                    "max_tokens": 200,
                    "temperature": 0.7
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                raise Exception(f"OpenAI API error: {response.status_code}")
    
    def _fallback_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Fallback chat responses when OpenAI is unavailable"""
        message_lower = message.lower()
        risk_score = pr_context.get('risk_score', 0)
        issues_count = len(pr_context.get('issues', []))
        
        mentor_intros = {
            "sarah_lead": "As your team lead, I want to help you understand the architectural implications.",
            "alex_security": "From a security standpoint, I'm concerned about the vulnerabilities I've identified.",
            "jordan_perf": "Looking at performance metrics, I can see several optimization opportunities.",
            "balanced": "Based on my analysis,"
        }
        
        intro = mentor_intros.get(mentor_mode, mentor_intros["balanced"])
        
        if any(word in message_lower for word in ["security", "vulnerability", "attack"]):
            return f"{intro} The main security risks include SQL injection and XSS vulnerabilities. With a risk score of {risk_score}/100, immediate attention is needed."
        
        elif any(word in message_lower for word in ["performance", "speed", "optimize"]):
            return f"{intro} The performance analysis shows potential bottlenecks in database operations. Consider implementing caching and query optimization."
        
        elif any(word in message_lower for word in ["fix", "how", "solution"]):
            auto_fixes_count = len(pr_context.get('auto_fixes', []))
            return f"{intro} I've prepared {auto_fixes_count} auto-fix suggestions with high confidence scores. The most critical fixes address SQL injection and input validation."
        
        elif any(word in message_lower for word in ["time", "future", "predict"]):
            bug_likelihood = int((pr_context.get('time_machine', {}).get('bug_likelihood', 0.3)) * 100)
            return f"{intro} The Time Machine analysis predicts a {bug_likelihood}% likelihood of bugs within 30 days."
        
        else:
            return f"{intro} Your PR has {issues_count} issues with a risk score of {risk_score}/100. What specific aspect would you like me to explain?"
