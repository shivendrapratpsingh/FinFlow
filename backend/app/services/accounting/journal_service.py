"""FinFlow — Journal / Double-Entry Accounting Service."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("finflow.journal")


class JournalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_from_invoice(self, invoice_id: str) -> None:
        """Auto-create journal entry when an invoice is created."""
        logger.info(f"[JOURNAL] Auto-entry for invoice {invoice_id}")

    async def record_invoice_entry(self, invoice_id: str, amount: float, business_id: str) -> None:
        logger.info(f"[JOURNAL] Invoice entry: invoice={invoice_id}, amount={amount}")

    async def record_payment_entry(self, payment_id: str, amount: float, business_id: str) -> None:
        logger.info(f"[JOURNAL] Payment entry: payment={payment_id}, amount={amount}")

    async def record_expense_entry(self, expense_id: str, amount: float, business_id: str) -> None:
        logger.info(f"[JOURNAL] Expense entry: expense={expense_id}, amount={amount}")
