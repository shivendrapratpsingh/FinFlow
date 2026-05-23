"""FinFlow — OCR Service (stub for dev)."""
import logging
logger = logging.getLogger(__name__)

class OCRService:
    async def extract_from_image(self, image_bytes: bytes) -> dict:
        logger.info("[OCR STUB] extract_from_image called")
        return {"text": "", "fields": {}, "confidence": 0.0}

    async def extract_invoice_data(self, image_bytes: bytes) -> dict:
        logger.info("[OCR STUB] extract_invoice_data called")
        return {"vendor": "", "amount": 0, "date": "", "items": []}
