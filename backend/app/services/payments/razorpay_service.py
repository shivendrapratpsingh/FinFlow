"""FinFlow — Razorpay Payment Service. Gracefully stubs when not configured."""
import logging
import hmac, hashlib
from app.core.config import settings

logger = logging.getLogger("finflow.payments")

RAZORPAY_ENABLED = bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def _get_client():
    if not RAZORPAY_ENABLED:
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except ImportError:
        logger.warning("razorpay package not installed. Run: pip install razorpay")
        return None


async def create_payment_order(amount_paise: int, currency: str = "INR", notes: dict = None) -> dict:
    """Create a Razorpay order. amount_paise = amount * 100."""
    client = _get_client()
    if not client:
        # Return a stub for local dev/testing
        return {
            "id": "order_stub_" + str(amount_paise),
            "amount": amount_paise,
            "currency": currency,
            "status": "created",
            "stub": True,
        }
    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "notes": notes or {},
        })
        return order
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay webhook signature."""
    if not RAZORPAY_ENABLED:
        return True  # Skip verification in dev/stub mode
    try:
        msg = f"{order_id}|{payment_id}"
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as e:
        logger.error(f"Signature verification failed: {e}")
        return False
