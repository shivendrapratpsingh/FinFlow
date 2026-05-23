"""FinFlow — Insights Service (stub for dev)."""
import logging
logger = logging.getLogger(__name__)

class InsightsService:
    def __init__(self, db=None):
        self.db = db

    async def get_business_insights(self, business_id: str) -> dict:
        logger.info("[INSIGHTS STUB] get_business_insights called")
        return {"insights": [], "recommendations": [], "alerts": []}

    async def get_cash_flow_forecast(self, business_id: str, days: int = 30) -> dict:
        return {"forecast": [], "trend": "stable"}
