# backend/app/services/chat_service.py
import httpx
import logging
from datetime import datetime
import os
from app.config import settings
from app.models.chat import ChatResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")  # Keep as fallback
    
    async def generate_response(self, message: str, mentor_mode: str, pr_context: dict) -> ChatResponse:
        """Generate chat response with mentor persona"""
        try:
            # Try Groq first, then OpenAI, then fallback
            if self.groq_key:
                response_text = await self._groq_chat(message, mentor_mode, pr_context)
                logger.info("Used Groq API successfully")
            elif self.openai_key:
                response_text = await self._openai_chat(message, mentor_mode, pr_context)
                logger.info("Used OpenAI API successfully")
            else:
                response_text = self._fallback_chat(message, mentor_mode, pr_context)
                logger.info("Used fallback responses")
            
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
            logger.error(f"All chat APIs failed: {e}")
            # Always return fallback if everything fails
            return ChatResponse(
                response=self._fallback_chat(message, mentor_mode, pr_context),
                timestamp=datetime.utcnow(),
                mentor_name="AI Reviewer"
            )
    
    async def _groq_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Chat with Groq API"""
        system_prompt = self._get_system_prompt(mentor_mode)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-70b-8192",  # Fast and good model
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
                raise Exception(f"Groq API error: {response.status_code}")
    
    async def _openai_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Chat with OpenAI API (fallback)"""
        system_prompt = self._get_system_prompt(mentor_mode)
        
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
    
    def _get_system_prompt(self, mentor_mode: str) -> str:
        """Get persona prompt for different mentor modes"""
        prompts = {
            "sarah_lead": "You are Sarah, an experienced team lead. Focus on architecture, maintainability, and team standards. Give thorough explanations and help developers understand the 'why' behind recommendations. Be patient and educational.",
            "alex_security": "You are Alex, a security expert. Focus on security vulnerabilities and compliance issues. Be direct and prioritize security above all else. Explain security risks clearly.",
            "jordan_perf": "You are Jordan, a performance optimization expert. Focus on metrics, scalability, and efficiency. Back up recommendations with data and focus on performance impact.",
            "balanced": "You are an AI code reviewer providing balanced, helpful feedback covering functionality, maintainability, and best practices."
        }
        return prompts.get(mentor_mode, prompts["balanced"])
    
    def _fallback_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Fallback chat responses when APIs are unavailable"""
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