"""FinFlow — WhatsApp Service. Stubs gracefully when not configured."""
import logging
from app.core.config import settings

logger = logging.getLogger("finflow.whatsapp")


async def send_invoice_whatsapp(phone: str, invoice_id: str, amount: float, customer_name: str) -> None:
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info(f"[WA STUB] Invoice {invoice_id} (₹{amount}) → {phone}")
        return
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://graph.facebook.com/v17.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
                headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
                json={
                    "messaging_product": "whatsapp",
                    "to": phone,
                    "type": "text",
                    "text": {
                        "body": f"Hi {customer_name}, Invoice #{invoice_id} for ₹{amount:,.2f} has been generated. Please make the payment at your earliest convenience. — FinFlow"
                    },
                },
            )
        logger.info(f"WhatsApp invoice sent to {phone}")
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
