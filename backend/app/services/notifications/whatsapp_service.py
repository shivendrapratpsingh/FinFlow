"""
FinFlow — WhatsApp Service
Stub implementation for development. Replace with WhatsApp Business API in production.
"""
import logging

logger = logging.getLogger(__name__)


async def send_invoice_whatsapp(phone: str, invoice_id: str, pdf_bytes: bytes = None) -> None:
    """Send invoice via WhatsApp."""
    logger.info(f"[WHATSAPP STUB] Invoice {invoice_id} → {phone}")


async def send_payment_reminder_whatsapp(phone: str, amount: float, due_date: str) -> None:
    """Send payment reminder via WhatsApp."""
    logger.info(f"[WHATSAPP STUB] Payment reminder → {phone}")


async def send_otp_whatsapp(phone: str, otp: str) -> None:
    """Send OTP via WhatsApp."""
    logger.info(f"[WHATSAPP STUB] OTP → {phone}")
