"""FinFlow — Alerts Service stub."""
import logging
logger = logging.getLogger(__name__)

class AlertsService:
    def __init__(self, db=None, business_id=None):
        self.db = db
        self.business_id = business_id

    async def get_alerts(self) -> list:
        return []
