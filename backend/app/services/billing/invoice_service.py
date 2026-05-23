"""FinFlow — Invoice Service."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.billing import Invoice, InvoiceStatus

logger = logging.getLogger(__name__)

class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_invoice(self, invoice_id: str, business_id: str):
        result = await self.db.execute(
            select(Invoice).where(
                Invoice.id == invoice_id,
                Invoice.business_id == business_id,
            )
        )
        return result.scalar_one_or_none()

    async def mark_paid(self, invoice_id: str, business_id: str) -> Invoice:
        invoice = await self.get_invoice(invoice_id, business_id)
        if invoice:
            invoice.status = InvoiceStatus.PAID
            await self.db.commit()
            await self.db.refresh(invoice)
        return invoice

    async def cancel_invoice(self, invoice_id: str, business_id: str) -> Invoice:
        invoice = await self.get_invoice(invoice_id, business_id)
        if invoice:
            invoice.status = InvoiceStatus.CANCELLED
            await self.db.commit()
            await self.db.refresh(invoice)
        return invoice
