"""FinFlow — GST Routes (GSTR-1, GSTR-3B, HSN summary)."""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.billing import Invoice, InvoiceStatus, InvoiceType
from app.db.models.user import User

router = APIRouter()


@router.get("/summary")
async def gst_summary(
    month: int = Query(default=date.today().month, ge=1, le=12),
    year: int = Query(default=date.today().year),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """GST summary for a given month — sales, purchases, tax payable."""
    biz_id = current_user.active_business_id
    from calendar import monthrange
    _, last_day = monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last_day)

    async def _sum(inv_type, col):
        q = await db.execute(
            select(func.coalesce(func.sum(col), 0)).where(
                and_(
                    Invoice.business_id == biz_id,
                    Invoice.invoice_type == inv_type,
                    Invoice.status != InvoiceStatus.CANCELLED,
                    Invoice.status != InvoiceStatus.DRAFT,
                    func.date(Invoice.invoice_date) >= start,
                    func.date(Invoice.invoice_date) <= end,
                )
            )
        )
        return float(q.scalar() or 0)

    sales_taxable  = await _sum(InvoiceType.SALE, Invoice.taxable_amount)
    sales_cgst     = await _sum(InvoiceType.SALE, Invoice.cgst_amount)
    sales_sgst     = await _sum(InvoiceType.SALE, Invoice.sgst_amount)
    sales_igst     = await _sum(InvoiceType.SALE, Invoice.igst_amount)
    sales_total    = await _sum(InvoiceType.SALE, Invoice.total_amount)

    purchase_taxable = await _sum(InvoiceType.PURCHASE, Invoice.taxable_amount)
    purchase_cgst    = await _sum(InvoiceType.PURCHASE, Invoice.cgst_amount)
    purchase_sgst    = await _sum(InvoiceType.PURCHASE, Invoice.sgst_amount)
    purchase_igst    = await _sum(InvoiceType.PURCHASE, Invoice.igst_amount)

    # ITC = input tax credit (taxes paid on purchases)
    itc = purchase_cgst + purchase_sgst + purchase_igst
    output_tax = sales_cgst + sales_sgst + sales_igst
    net_payable = max(0, output_tax - itc)

    return {
        "period": f"{year}-{month:02d}",
        "sales": {
            "taxable_amount": round(sales_taxable, 2),
            "cgst": round(sales_cgst, 2),
            "sgst": round(sales_sgst, 2),
            "igst": round(sales_igst, 2),
            "total_tax": round(output_tax, 2),
            "total_amount": round(sales_total, 2),
        },
        "purchases": {
            "taxable_amount": round(purchase_taxable, 2),
            "cgst": round(purchase_cgst, 2),
            "sgst": round(purchase_sgst, 2),
            "igst": round(purchase_igst, 2),
            "itc": round(itc, 2),
        },
        "gst_payable": round(net_payable, 2),
        "itc_available": round(itc, 2),
        "output_tax": round(output_tax, 2),
        "filing_due": f"{year}-{month:02d}-20",
    }


@router.get("/gstr1")
async def gstr1_data(
    month: int = Query(default=date.today().month, ge=1, le=12),
    year: int = Query(default=date.today().year),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """GSTR-1 B2B/B2C sales data for filing."""
    biz_id = current_user.active_business_id
    from calendar import monthrange
    _, last_day = monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last_day)

    q = await db.execute(
        select(Invoice).where(
            and_(
                Invoice.business_id == biz_id,
                Invoice.invoice_type == InvoiceType.SALE,
                Invoice.status != InvoiceStatus.CANCELLED,
                Invoice.status != InvoiceStatus.DRAFT,
                func.date(Invoice.invoice_date) >= start,
                func.date(Invoice.invoice_date) <= end,
            )
        ).order_by(Invoice.invoice_date)
    )
    invoices = q.scalars().all()

    return {
        "period": f"{year}-{month:02d}",
        "total_invoices": len(invoices),
        "invoices": [
            {
                "invoice_number": inv.invoice_number,
                "date": str(inv.invoice_date),
                "customer": inv.customer_name,
                "taxable_amount": float(inv.taxable_amount or 0),
                "cgst": float(inv.cgst_amount or 0),
                "sgst": float(inv.sgst_amount or 0),
                "igst": float(inv.igst_amount or 0),
                "total": float(inv.total_amount or 0),
                "place_of_supply": inv.place_of_supply,
            }
            for inv in invoices
        ],
    }


@router.get("/")
async def gst_root(current_user=Depends(get_current_active_user)):
    return {"module": "gst", "endpoints": ["/summary", "/gstr1"]}
