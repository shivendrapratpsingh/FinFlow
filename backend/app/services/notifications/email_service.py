"""
FinFlow — Email Service
Works with Gmail SMTP when SMTP_USER + SMTP_PASSWORD are set in .env.
Falls back to logging stub when not configured (local dev).
"""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from app.core.config import settings

logger = logging.getLogger("finflow.email")


def _send(to: str, subject: str, body: str, attachment_bytes: bytes = None, attachment_name: str = None):
    """Send email via SMTP. Returns True on success."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        if attachment_bytes and attachment_name:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment_bytes)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={attachment_name}")
            msg.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to, msg.as_string())

        logger.info(f"Email sent to {to}")
        return True

    except Exception as e:
        logger.error(f"Email failed to {to}: {e}")
        return False


async def send_verification_email(email: str, full_name: str) -> None:
    _send(email, "Welcome to FinFlow — Verify your account",
          f"<p>Hi {full_name},</p><p>Welcome to FinFlow! Your account is ready to use.</p>")


async def send_invoice_email(email: str, invoice_id: str, pdf_bytes: bytes = None) -> None:
    _send(email, f"Invoice #{invoice_id} from your supplier",
          f"<p>Please find your invoice attached.</p>",
          attachment_bytes=pdf_bytes, attachment_name=f"invoice_{invoice_id}.pdf")


async def send_password_reset_email(email: str, reset_token: str) -> None:
    _send(email, "FinFlow — Password Reset Request",
          f"<p>Your password reset token is: <b>{reset_token}</b></p><p>Valid for 15 minutes.</p>")


async def send_payment_receipt_email(email: str, amount: float, invoice_id: str) -> None:
    _send(email, "Payment Receipt from FinFlow",
          f"<p>We received your payment of ₹{amount:,.2f} for invoice #{invoice_id}. Thank you!</p>")
