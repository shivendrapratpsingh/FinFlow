"""
FinFlow — SMS Service
Stub implementation for development. Replace with Twilio/MSG91 in production.
"""
import logging

logger = logging.getLogger(__name__)


async def send_otp_sms(phone: str, otp: str) -> None:
    """Send OTP via SMS."""
    logger.info(f"[SMS STUB] OTP {otp} → {phone}")
    # In dev mode, print to console so you can use it
    print(f"\n📱 OTP for {phone}: {otp}\n")


async def send_payment_reminder_sms(phone: str, amount: float, due_date: str) -> None:
    """Send payment reminder SMS."""
    logger.info(f"[SMS STUB] Payment reminder → {phone} (amount: {amount})")


async def send_invoice_sms(phone: str, invoice_number: str, amount: float) -> None:
    """Send invoice notification SMS."""
    logger.info(f"[SMS STUB] Invoice {invoice_number} → {phone}")
