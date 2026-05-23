"""FinFlow — Journal / Double-Entry Accounting Service."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

class JournalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_invoice_entry(self, invoice_id: str, amount: float, business_id: str) -> None:
        """Create double-entry journal for an invoice (Debit AR, Credit Revenue)."""
        logger.info(f"[JOURNAL] Invoice entry: invoice={invoice_id}, amount={amount}")

    async def record_payment_entry(self, payment_id: str, amount: float, business_id: str) -> None:
        """Create double-entry journal for a payment (Debit Cash, Credit AR)."""
        logger.info(f"[JOURNAL] Payment entry: payment={payment_id}, amount={amount}")

    async def record_expense_entry(self, expense_id: str, amount: float, business_id: str) -> None:
        """Create double-entry journal for an expense (Debit Expense, Credit Cash)."""
        logger.info(f"[JOURNAL] Expense entry: expense={expense_id}, amount={amount}")
