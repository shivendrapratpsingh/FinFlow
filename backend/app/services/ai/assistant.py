"""FinFlow — AI Assistant (gracefully degrades without OpenAI key)."""
import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

try:
    from langchain_openai import ChatOpenAI
    from langchain.schema import HumanMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    logger.warning("LangChain not available — AI features disabled")


class FinFlowAssistant:
    def __init__(self, db: AsyncSession, business_id: str, user_id: str):
        self.db = db
        self.business_id = business_id
        self.user_id = user_id
        self.llm = None
        if LANGCHAIN_AVAILABLE:
            try:
                from app.core.config import settings
                if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "sk-placeholder":
                    self.llm = ChatOpenAI(
                        model=settings.OPENAI_MODEL,
                        api_key=settings.OPENAI_API_KEY,
                        temperature=0.3,
                    )
            except Exception as e:
                logger.warning(f"Could not init LLM: {e}")

    async def chat(self, message: str, history: list = None) -> str:
        if not self.llm:
            return (
                "AI assistant is not configured yet. "
                "Add your OpenAI API key to the .env file (OPENAI_API_KEY=sk-...) and restart the backend."
            )
        try:
            from langchain.schema import HumanMessage, SystemMessage
            messages = [
                SystemMessage(content="You are FinFlow's AI accounting assistant for Indian small businesses. Help with GST, invoices, expenses, and financial questions."),
                HumanMessage(content=message),
            ]
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

    async def stream_chat(self, message: str) -> AsyncGenerator[str, None]:
        response = await self.chat(message)
        yield response
