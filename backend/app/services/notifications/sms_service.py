"""FinFlow — SMS Service (Twilio). Stubs gracefully when not configured."""
import logging
from app.core.config import settings

logger = logging.getLogger("finflow.sms")


async def send_otp_sms(phone: str, otp: str) -> None:
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.info(f"[SMS STUB] OTP {otp} → {phone}")
        return
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Your FinFlow OTP is: {otp}. Valid for 10 minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone,
        )
        logger.info(f"OTP SMS sent to {phone}")
    except ImportError:
        logger.info(f"[SMS STUB] Twilio not installed. OTP {otp} → {phone}")
    except Exception as e:
        logger.error(f"SMS failed: {e}")


async def send_payment_reminder_sms(phone: str, amount: float, customer_name: str) -> None:
    if not settings.TWILIO_ACCOUNT_SID:
        logger.info(f"[SMS STUB] Payment reminder ₹{amount} → {phone}")
        return
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Hi {customer_name}, you have an outstanding payment of ₹{amount:,.0f}. Please pay at your earliest. — FinFlow",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone,
        )
    except Exception as e:
        logger.error(f"SMS reminder failed: {e}")
