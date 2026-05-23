"""FinFlow — Voice Service stub."""
import logging
logger = logging.getLogger(__name__)

class VoiceService:
    async def transcribe(self, audio_bytes: bytes) -> str:
        logger.info("[VOICE STUB] transcribe called")
        return ""
