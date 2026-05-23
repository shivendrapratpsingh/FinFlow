"""FinFlow — Razorpay Service stub."""
import logging
logger = logging.getLogger(__name__)

class RazorpayService:
    def __init__(self):
        pass
    async def create_order(self, amount: float, currency: str = "INR") -> dict:
        logger.info(f"[RAZORPAY STUB] create_order: {amount} {currency}")
        return {"order_id": "stub_order", "amount": amount, "currency": currency}
    async def verify_payment(self, payment_id: str, order_id: str, signature: str) -> bool:
        logger.info(f"[RAZORPAY STUB] verify_payment: {payment_id}")
        return True
