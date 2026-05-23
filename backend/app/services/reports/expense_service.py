"""FinFlow — Expense Report Service stub."""
import logging
logger = logging.getLogger(__name__)

class ExpenseService:
    def __init__(self, db=None, business_id=None):
        self.db = db
        self.business_id = business_id
    async def get_expense_report(self, period: str = "this_month") -> dict:
        return {"total": 0, "by_month": [], "by_category": []}
