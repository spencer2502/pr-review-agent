# backend/services/chat_service.py
import httpx
import logging
from datetime import datetime
import os
from models.chat import ChatResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY not set in environment variables")
        logger.info("ChatService initialized with Google Gemini API")

    async def generate_response(self, message: str, mentor_mode: str, pr_context: dict) -> ChatResponse:
        """Generate chat response with mentor persona using Google Gemini"""
        try:
            response_text = await self._gemini_chat(message, mentor_mode, pr_context)
            logger.info("Gemini API responded successfully")

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
            logger.error(f"Gemini API failed: {e}", exc_info=True)
            return ChatResponse(
                response=self._fallback_chat(message, mentor_mode, pr_context),
                timestamp=datetime.utcnow(),
                mentor_name="AI Reviewer"
            )

    async def _gemini_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        """Chat with Google Gemini API"""
        system_prompt = self._get_system_prompt(mentor_mode)
        user_prompt = self._build_user_prompt(message, pr_context)

        combined_prompt = f"{system_prompt}\n\n{user_prompt}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={self.gemini_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": combined_prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": 800,
                        "temperature": 0.5,
                        "topP": 0.8,
                        "topK": 40
                    }
                },
                timeout=20.0
            )

        if response.status_code == 200:
            try:
                result = response.json()
                return result["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                raise Exception(f"Unexpected Gemini response format: {response.text}") from e
        else:
            raise Exception(f"Gemini API error {response.status_code}: {response.text}")

    def _build_user_prompt(self, message: str, pr_context: dict) -> str:
        pr_title = pr_context.get("title", "Untitled PR")
        pr_summary = pr_context.get("summary", "")
        pr_diff = pr_context.get("diff", "No code diff available")
        issues = pr_context.get("issues", [])
        risk_score = pr_context.get("risk_score", 0)

        return f"""
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
        - Highlight security, performance, and maintainability issues.
        - Reference specific lines/functions from the diff if possible.
        - Give concrete suggestions for improvements.
        - Tailor tone based on your persona.
        - Be helpful and constructive in your feedback.
        """

    def _get_system_prompt(self, mentor_mode: str) -> str:
        prompts = {
            "sarah_lead": (
                "You are Sarah, an experienced team lead. "
                "Focus on architecture, maintainability, and team standards. "
                "Explain the 'why' behind recommendations in a patient, educational tone."
            ),
            "alex_security": (
                "You are Alex, a security expert. "
                "Focus on vulnerabilities, compliance issues, and risks. "
                "Be direct and prioritize security."
            ),
            "jordan_perf": (
                "You are Jordan, a performance optimization expert. "
                "Focus on scalability, efficiency, and metrics. "
                "Provide optimization tips with reasoning."
            ),
            "balanced": (
                "You are an AI reviewer giving balanced, constructive feedback "
                "on functionality, maintainability, and best practices."
            ),
        }
        return prompts.get(mentor_mode, prompts["balanced"])

    def _fallback_chat(self, message: str, mentor_mode: str, pr_context: dict) -> str:
        risk_score = pr_context.get("risk_score", 0)
        issues_count = len(pr_context.get("issues", []))

        mentor_intros = {
            "sarah_lead": "As your team lead, I’ll guide you on design and maintainability.",
            "alex_security": "From a security perspective, here are some concerns.",
            "jordan_perf": "From a performance standpoint, I see optimization areas.",
            "balanced": "Based on my analysis,"
        }
        intro = mentor_intros.get(mentor_mode, mentor_intros["balanced"])

        return f"{intro} Your PR shows {issues_count} issues with a risk score of {risk_score}/100. " \
               f"What aspect would you like me to elaborate on? (Note: Gemini service is temporarily unavailable)"
