"""
FinFlow — Email Service
Stub implementation for development. Replace with real SMTP in production.
"""
import logging

logger = logging.getLogger(__name__)


async def send_verification_email(email: str, full_name: str) -> None:
    """Send email verification link."""
    logger.info(f"[EMAIL STUB] Verification email → {email} (name: {full_name})")


async def send_invoice_email(email: str, invoice_id: str, pdf_bytes: bytes = None) -> None:
    """Send invoice PDF to customer."""
    logger.info(f"[EMAIL STUB] Invoice email → {email} (invoice: {invoice_id})")


async def send_password_reset_email(email: str, reset_token: str) -> None:
    """Send password reset link."""
    logger.info(f"[EMAIL STUB] Password reset email → {email}")


async def send_payment_receipt_email(email: str, amount: float, invoice_id: str) -> None:
    """Send payment receipt to customer."""
    logger.info(f"[EMAIL STUB] Payment receipt → {email} (amount: {amount})")
