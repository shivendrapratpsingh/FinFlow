"""FinFlow — Invoice Service with full GST calculation and auto-numbering."""
import logging
from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.models.billing import Invoice, InvoiceLineItem, InvoiceStatus, InvoiceType, Customer, Payment

logger = logging.getLogger("finflow.billing")


def _calc_gst(taxable: Decimal, gst_rate: Decimal, is_igst: bool):
    """Return (cgst, sgst, igst) amounts."""
    tax = (taxable * gst_rate / Decimal("100")).quantize(Decimal("0.01"), ROUND_HALF_UP)
    if is_igst:
        return Decimal("0"), Decimal("0"), tax
    half = (tax / Decimal("2")).quantize(Decimal("0.01"), ROUND_HALF_UP)
    return half, tax - half, Decimal("0")


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _next_invoice_number(self, business_id: str, prefix: str = "INV") -> str:
        result = await self.db.execute(
            select(func.count(Invoice.id)).where(Invoice.business_id == business_id)
        )
        count = int(result.scalar() or 0) + 1
        return f"{prefix}-{date.today().year}-{count:04d}"

    async def get_invoice(self, invoice_id: str, business_id: str):
        result = await self.db.execute(
            select(Invoice).where(
                Invoice.id == invoice_id,
                Invoice.business_id == business_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_invoice(self, data, business_id: str, user_id: str) -> Invoice:
        from app.schemas.billing import InvoiceCreateRequest
        inv_date = date.fromisoformat(data.invoice_date)
        due = date.fromisoformat(data.due_date) if data.due_date else None

        # Determine inter-state (IGST) — simplified: if no place_of_supply, use CGST/SGST
        is_igst = False  # can be extended with state detection

        # Build line items & totals
        subtotal = Decimal("0")
        discount_total = Decimal("0")
        cgst_total = Decimal("0")
        sgst_total = Decimal("0")
        igst_total = Decimal("0")
        line_objs = []

        for item in data.line_items:
            qty = Decimal(str(item.quantity))
            rate = Decimal(str(item.rate))
            disc_pct = Decimal(str(item.discount_percent))
            gst_rate = Decimal(str(item.gst_rate))

            line_total = (qty * rate).quantize(Decimal("0.01"), ROUND_HALF_UP)
            disc_amt = (line_total * disc_pct / Decimal("100")).quantize(Decimal("0.01"), ROUND_HALF_UP)
            taxable = line_total - disc_amt
            cgst, sgst, igst = _calc_gst(taxable, gst_rate, is_igst)
            total = taxable + cgst + sgst + igst

            subtotal += line_total
            discount_total += disc_amt
            cgst_total += cgst
            sgst_total += sgst
            igst_total += igst

            line_objs.append(InvoiceLineItem(
                description=item.description,
                hsn_sac_code=item.hsn_sac_code,
                quantity=qty,
                unit=item.unit,
                rate=rate,
                discount_percent=disc_pct,
                discount_amount=disc_amt,
                gst_rate=gst_rate,
                cgst_rate=gst_rate / 2 if not is_igst else Decimal("0"),
                sgst_rate=gst_rate / 2 if not is_igst else Decimal("0"),
                igst_rate=gst_rate if is_igst else Decimal("0"),
                cgst_amount=cgst,
                sgst_amount=sgst,
                igst_amount=igst,
                taxable_amount=taxable,
                total_amount=total,
                product_id=str(item.product_id) if item.product_id else None,
            ))

        taxable_amount = subtotal - discount_total
        total_tax = cgst_total + sgst_total + igst_total
        total_amount = taxable_amount + total_tax

        # Customer name fallback
        customer_name = data.customer_name or "Cash Customer"
        if data.customer_id:
            cq = await self.db.execute(select(Customer).where(Customer.id == str(data.customer_id)))
            c = cq.scalar_one_or_none()
            if c:
                customer_name = c.name

        invoice = Invoice(
            business_id=business_id,
            customer_id=str(data.customer_id) if data.customer_id else None,
            customer_name=customer_name,
            created_by_id=user_id,
            invoice_number=await self._next_invoice_number(business_id),
            invoice_type=InvoiceType.SALE,
            status=InvoiceStatus.DRAFT,
            invoice_date=inv_date,
            due_date=due,
            place_of_supply=data.place_of_supply,
            subtotal=subtotal,
            discount_amount=discount_total,
            taxable_amount=taxable_amount,
            cgst_amount=cgst_total,
            sgst_amount=sgst_total,
            igst_amount=igst_total,
            total_tax=total_tax,
            total_amount=total_amount,
            paid_amount=Decimal("0"),
            balance_due=total_amount,
            is_igst=is_igst,
            notes=data.notes,
            terms_and_conditions=data.terms_and_conditions,
            payment_terms=data.payment_terms,
        )
        self.db.add(invoice)
        await self.db.flush()  # get invoice.id

        for li in line_objs:
            li.invoice_id = invoice.id
            self.db.add(li)

        await self.db.commit()
        await self.db.refresh(invoice)
        logger.info(f"Invoice {invoice.invoice_number} created for business {business_id}")
        return invoice

    async def update_invoice(self, invoice_id: str, data, business_id: str) -> Invoice:
        invoice = await self.get_invoice(invoice_id, business_id)
        if not invoice:
            return None
        if data.status:
            invoice.status = data.status
        if data.due_date:
            invoice.due_date = date.fromisoformat(data.due_date)
        if data.notes is not None:
            invoice.notes = data.notes
        await self.db.commit()
        await self.db.refresh(invoice)
        return invoice

    async def record_payment(self, invoice_id: str, data, business_id: str) -> Payment:
        invoice = await self.get_invoice(invoice_id, business_id)
        if not invoice:
            return None
        amount = Decimal(str(data.amount))
        payment = Payment(
            business_id=business_id,
            invoice_id=invoice_id,
            customer_id=invoice.customer_id,
            amount=amount,
            payment_date=date.fromisoformat(data.payment_date) if data.payment_date else date.today(),
            payment_method=data.payment_method or "cash",
            reference_number=data.reference_number,
        )
        self.db.add(payment)
        invoice.paid_amount += amount
        invoice.balance_due -= amount
        if invoice.balance_due <= Decimal("0"):
            invoice.status = InvoiceStatus.PAID
            invoice.balance_due = Decimal("0")
        elif invoice.paid_amount > Decimal("0"):
            invoice.status = InvoiceStatus.PARTIAL
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def mark_paid(self, invoice_id: str, business_id: str) -> Invoice:
        invoice = await self.get_invoice(invoice_id, business_id)
        if invoice:
            invoice.status = InvoiceStatus.PAID
            invoice.paid_amount = invoice.total_amount
            invoice.balance_due = Decimal("0")
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

    async def list_invoices(self, business_id: str, status=None, customer_id=None,
                             from_date=None, to_date=None, search=None,
                             page: int = 1, page_size: int = 20):
        q = select(Invoice).where(Invoice.business_id == business_id)
        if status:
            q = q.where(Invoice.status == status)
        if customer_id:
            q = q.where(Invoice.customer_id == str(customer_id))
        if from_date:
            q = q.where(Invoice.invoice_date >= date.fromisoformat(from_date))
        if to_date:
            q = q.where(Invoice.invoice_date <= date.fromisoformat(to_date))
        if search:
            q = q.where(Invoice.invoice_number.ilike(f"%{search}%"))
        count_q = await self.db.execute(select(func.count()).select_from(q.subquery()))
        total = count_q.scalar()
        q = q.order_by(Invoice.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(q)
        invoices = result.scalars().all()
        import math
        return invoices, total, math.ceil(total / page_size) if total else 1

    async def generate_invoice_pdf(self, invoice_id: str, business_id: str) -> bytes:
        """Delegate to PDF service."""
        invoice = await self.get_invoice(invoice_id, business_id)
        if not invoice:
            return b""
        from app.services.billing.pdf_service import PDFService
        return await PDFService().generate(invoice)
