"""FinFlow — Accounting Routes (ledgers, journal entries, trial balance)."""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.accounting import Ledger, LedgerGroup
from app.db.models.billing import Invoice, InvoiceType, InvoiceStatus
from app.db.models.user import User

router = APIRouter()


@router.get("/ledgers")
async def list_ledgers(
    group: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    biz_id = current_user.active_business_id
    q = select(Ledger).where(Ledger.business_id == biz_id)
    if group:
        q = q.where(Ledger.group == group)
    result = await db.execute(q.order_by(Ledger.name))
    ledgers = result.scalars().all()
    return [
        {
            "id": l.id, "name": l.name, "group": l.group,
            "balance": float(l.current_balance or 0),
            "opening_balance": float(l.opening_balance or 0),
            "is_default": getattr(l, "is_default", False),
        }
        for l in ledgers
    ]


@router.get("/trial-balance")
async def trial_balance(
    as_of: str = Query(default=str(date.today())),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    biz_id = current_user.active_business_id
    # Derive from invoices as approximation
    as_of_date = date.fromisoformat(as_of)

    sales_q = await db.execute(
        select(func.coalesce(func.sum(Invoice.taxable_amount), 0)).where(
            and_(Invoice.business_id == biz_id, Invoice.invoice_type == InvoiceType.SALE,
                 Invoice.status != InvoiceStatus.CANCELLED,
                 func.date(Invoice.invoice_date) <= as_of_date)
        )
    )
    purchase_q = await db.execute(
        select(func.coalesce(func.sum(Invoice.taxable_amount), 0)).where(
            and_(Invoice.business_id == biz_id, Invoice.invoice_type == InvoiceType.PURCHASE,
                 Invoice.status != InvoiceStatus.CANCELLED,
                 func.date(Invoice.invoice_date) <= as_of_date)
        )
    )
    ar_q = await db.execute(
        select(func.coalesce(func.sum(Invoice.balance_due), 0)).where(
            and_(Invoice.business_id == biz_id, Invoice.invoice_type == InvoiceType.SALE,
                 Invoice.balance_due > 0)
        )
    )

    sales = float(sales_q.scalar() or 0)
    purchases = float(purchase_q.scalar() or 0)
    ar = float(ar_q.scalar() or 0)

    return {
        "as_of": as_of,
        "debit_entries": [
            {"ledger": "Accounts Receivable", "group": "current_assets", "amount": round(ar, 2)},
            {"ledger": "Purchases", "group": "purchase", "amount": round(purchases, 2)},
        ],
        "credit_entries": [
            {"ledger": "Sales Revenue", "group": "sales", "amount": round(sales, 2)},
        ],
        "total_debit": round(ar + purchases, 2),
        "total_credit": round(sales, 2),
    }


@router.get("/")
async def accounting_root(current_user=Depends(get_current_active_user)):
    return {"module": "accounting", "endpoints": ["/ledgers", "/trial-balance"]}
