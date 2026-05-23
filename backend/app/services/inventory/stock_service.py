"""FinFlow — Stock Service stub."""
import logging
logger = logging.getLogger(__name__)

class StockService:
    def __init__(self, db=None, business_id=None):
        self.db = db
        self.business_id = business_id
    async def get_stock_levels(self) -> list:
        return []
    async def adjust_stock(self, product_id: str, quantity: int, reason: str) -> dict:
        return {"success": True}
