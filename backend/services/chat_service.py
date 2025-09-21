# backend/app/services/chat_service.py
import httpx
import logging
from datetime import datetime
import os
from models.chat import ChatResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        if not self.groq_key:
            raise ValueError("GROQ_API_KEY not set in environment variables")

    async def generate_response(self, message: str, mentor_mode: str, pr_context: dict) -> ChatResponse:
        """Generate chat response with mentor persona using Groq"""
        try:
            response_text = await self._groq_chat(message, mentor_mode, pr_context)
            logger.info("Used Groq API successfully")

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
            logger.error(f"Groq API failed: {e}")
            # Always return fallback if Groq fails
            return ChatResponse(
                response=self._fallback_chat(message, mentor_mode, pr_context),
                timestamp=datetime.utcnow(),
                mentor_name="AI Reviewer"
            )

    async def _groq_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Chat with Groq API"""
        system_prompt = self._get_system_prompt(mentor_mode)

        # Extract richer context
        pr_title = pr_context.get("title", "Untitled PR")
        pr_summary = pr_context.get("summary", "")
        pr_diff = pr_context.get("diff", "No code diff available")
        issues = pr_context.get("issues", [])
        risk_score = pr_context.get("risk_score", 0)

        user_prompt = f"""
        You are reviewing a Pull Request.

        Title: {pr_title}
        Summary: {pr_summary}
        Risk Score: {risk_score}/100
        Issues Found: {len(issues)}

        Code Diff:
        {pr_diff}

        Developer's Question:
        {message}

        Please:
        - Highlight **security, performance, and maintainability** issues.
        - Reference specific lines/functions from the diff if possible.
        - Give concrete suggestions for improvements.
        - Tailor tone based on your persona ({mentor_mode}).
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-70b-8192",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 800,   # allow detailed reviews
                    "temperature": 0.5   # focused, not too random
                },
                timeout=20.0
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                raise Exception(f"Groq API error: {response.status_code} {response.text}")

    def _get_system_prompt(self, mentor_mode: str) -> str:
        """Get persona prompt for different mentor modes"""
        prompts = {
            "sarah_lead": (
                "You are Sarah, an experienced team lead. "
                "Focus on architecture, maintainability, and team standards. "
                "Give thorough explanations and help developers understand the 'why' behind recommendations. "
                "Be patient and educational."
            ),
            "alex_security": (
                "You are Alex, a security expert. "
                "Focus on security vulnerabilities and compliance issues. "
                "Be direct and prioritize security above all else. "
                "Explain security risks clearly."
            ),
            "jordan_perf": (
                "You are Jordan, a performance optimization expert. "
                "Focus on metrics, scalability, and efficiency. "
                "Back up recommendations with data and focus on performance impact."
            ),
            "balanced": (
                "You are an AI code reviewer providing balanced, helpful feedback "
                "covering functionality, maintainability, and best practices."
            ),
        }
        return prompts.get(mentor_mode, prompts["balanced"])

    def _fallback_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Fallback chat responses when Groq API is unavailable"""
        risk_score = pr_context.get('risk_score', 0)
        issues_count = len(pr_context.get('issues', []))

        mentor_intros = {
            "sarah_lead": "As your team lead, I want to help you understand the architectural implications.",
            "alex_security": "From a security standpoint, I'm concerned about the vulnerabilities I've identified.",
            "jordan_perf": "Looking at performance metrics, I can see several optimization opportunities.",
            "balanced": "Based on my analysis,"
        }
        intro = mentor_intros.get(mentor_mode, mentor_intros["balanced"])

        return f"{intro} Your PR has {issues_count} issues with a risk score of {risk_score}/100. " \
               f"What specific aspect would you like me to explain?"
