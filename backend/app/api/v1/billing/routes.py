"""
FinFlow — Billing & Invoice Routes
Create, manage, share, and track invoices.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.billing import Invoice, InvoiceStatus, InvoiceType, Customer, Payment
from app.db.models.user import User
from app.schemas.billing import (
    InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse,
    InvoiceListResponse, CustomerCreateRequest, CustomerResponse,
    PaymentCreateRequest, PaymentResponse,
    InvoiceShareRequest,
)
from app.services.billing.invoice_service import InvoiceService
from app.services.billing.pdf_service import PDFService
from app.services.notifications.whatsapp_service import send_invoice_whatsapp
from app.services.notifications.email_service import send_invoice_email
from app.services.accounting.journal_service import JournalService

router = APIRouter()


# ── Customers ────────────────────────────────────────────────

@router.post("/customers", response_model=CustomerResponse, status_code=201)
async def create_customer(
    data: CustomerCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    customer = Customer(**data.model_dump(), business_id=current_user.active_business_id)
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.get("/customers", response_model=List[CustomerResponse])
async def list_customers(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Customer).where(Customer.business_id == current_user.active_business_id)
    if search:
        query = query.where(Customer.name.ilike(f"%{search}%"))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Customer).where(
            and_(Customer.id == customer_id, Customer.business_id == current_user.active_business_id)
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# ── Invoices ─────────────────────────────────────────────────

@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    data: InvoiceCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new invoice with auto-numbering and GST calculation."""
    service = InvoiceService(db)
    invoice = await service.create_invoice(data, current_user.active_business_id, current_user.id)

    # Auto-create journal entry
    background_tasks.add_task(
        JournalService(db).create_from_invoice,
        invoice.id
    )
    return invoice


@router.get("/invoices", response_model=InvoiceListResponse)
async def list_invoices(
    status: Optional[InvoiceStatus] = None,
    customer_id: Optional[UUID] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = InvoiceService(db)
    return await service.list_invoices(
        business_id=current_user.active_business_id,
        status=status, customer_id=customer_id,
        from_date=from_date, to_date=to_date,
        search=search, page=page, page_size=page_size,
    )


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(
            and_(Invoice.id == invoice_id, Invoice.business_id == current_user.active_business_id)
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    data: InvoiceUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = InvoiceService(db)
    return await service.update_invoice(invoice_id, data, current_user.active_business_id)


@router.delete("/invoices/{invoice_id}", status_code=204)
async def cancel_invoice(
    invoice_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(
            and_(Invoice.id == invoice_id, Invoice.business_id == current_user.active_business_id)
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = InvoiceStatus.CANCELLED
    await db.commit()


@router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and download PDF for an invoice."""
    service = PDFService(db)
    pdf_bytes = await service.generate_invoice_pdf(invoice_id, current_user.active_business_id)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"},
    )


@router.post("/invoices/{invoice_id}/share")
async def share_invoice(
    invoice_id: UUID,
    data: InvoiceShareRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Share invoice via WhatsApp, Email, or SMS."""
    if data.method == "whatsapp":
        background_tasks.add_task(send_invoice_whatsapp, invoice_id, data.recipient)
    elif data.method == "email":
        background_tasks.add_task(send_invoice_email, invoice_id, data.recipient)
    return {"message": f"Invoice will be sent via {data.method}"}


@router.post("/invoices/{invoice_id}/payment", response_model=PaymentResponse, status_code=201)
async def record_payment(
    invoice_id: UUID,
    data: PaymentCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a payment received against an invoice."""
    service = InvoiceService(db)
    payment = await service.record_payment(invoice_id, data, current_user.active_business_id)
    return payment


@router.get("/invoices/{invoice_id}/payment-link")
async def create_payment_link(
    invoice_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a Razorpay payment link for an invoice."""
    from app.services.payments.razorpay_service import RazorpayService
    service = RazorpayService()
    link = await service.create_payment_link(invoice_id, db)
    return {"payment_link": link}
