"""FinFlow — Dashboard Service with real DB queries."""
import logging
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

logger = logging.getLogger("finflow.dashboard")


def _period_dates(period: str):
    today = date.today()
    if period == "today":
        return today, today
    elif period == "this_week":
        start = today - timedelta(days=today.weekday())
        return start, today
    elif period == "this_month":
        return today.replace(day=1), today
    elif period == "this_year":
        return today.replace(month=1, day=1), today
    elif period == "last_month":
        first = today.replace(day=1)
        last_month_end = first - timedelta(days=1)
        return last_month_end.replace(day=1), last_month_end
    return today.replace(day=1), today


class DashboardService:
    def __init__(self, db: AsyncSession, business_id=None):
        self.db = db
        self.business_id = business_id

    async def get_dashboard(self, period: str = "this_month") -> dict:
        kpis = await self.get_kpis(period)
        alerts = await self._get_alerts()
        recent_invoices = await self._get_recent_invoices()
        top_customers = await self._get_top_customers()
        chart = await self._get_revenue_chart()

        return {
            "period": period,
            "kpis": kpis,
            "recent_invoices": recent_invoices,
            "top_customers": top_customers,
            "alerts": alerts,
            "revenue_chart": chart,
        }

    async def get_kpis(self, period: str = "this_month") -> dict:
        if not self.business_id:
            return {"revenue": 0, "expenses": 0, "profit": 0, "outstanding": 0, "invoices_count": 0}

        start, end = _period_dates(period)
        try:
            from app.db.models.billing import Invoice, InvoiceStatus, InvoiceType

            # Revenue = sum of paid SALE invoices in period
            rev_q = await self.db.execute(
                select(func.coalesce(func.sum(Invoice.total_amount), 0)).where(
                    and_(
                        Invoice.business_id == self.business_id,
                        Invoice.invoice_type == InvoiceType.SALE,
                        Invoice.status == InvoiceStatus.PAID,
                        func.date(Invoice.invoice_date) >= start,
                        func.date(Invoice.invoice_date) <= end,
                    )
                )
            )
            revenue = float(rev_q.scalar() or 0)

            # Expenses = sum of paid PURCHASE invoices
            exp_q = await self.db.execute(
                select(func.coalesce(func.sum(Invoice.total_amount), 0)).where(
                    and_(
                        Invoice.business_id == self.business_id,
                        Invoice.invoice_type == InvoiceType.PURCHASE,
                        Invoice.status == InvoiceStatus.PAID,
                        func.date(Invoice.invoice_date) >= start,
                        func.date(Invoice.invoice_date) <= end,
                    )
                )
            )
            expenses = float(exp_q.scalar() or 0)

            # Outstanding = sum of sent/overdue SALE invoices
            out_q = await self.db.execute(
                select(func.coalesce(func.sum(Invoice.balance_due), 0)).where(
                    and_(
                        Invoice.business_id == self.business_id,
                        Invoice.invoice_type == InvoiceType.SALE,
                        Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIAL]),
                    )
                )
            )
            outstanding = float(out_q.scalar() or 0)

            # Total invoice count
            cnt_q = await self.db.execute(
                select(func.count(Invoice.id)).where(
                    and_(
                        Invoice.business_id == self.business_id,
                        func.date(Invoice.invoice_date) >= start,
                        func.date(Invoice.invoice_date) <= end,
                    )
                )
            )
            count = int(cnt_q.scalar() or 0)

            return {
                "revenue": round(revenue, 2),
                "expenses": round(expenses, 2),
                "profit": round(revenue - expenses, 2),
                "outstanding": round(outstanding, 2),
                "invoices_count": count,
            }
        except Exception as e:
            logger.error(f"KPI query failed: {e}")
            return {"revenue": 0, "expenses": 0, "profit": 0, "outstanding": 0, "invoices_count": 0}

    async def _get_recent_invoices(self, limit: int = 10) -> list:
        if not self.business_id:
            return []
        try:
            from app.db.models.billing import Invoice, InvoiceType
            q = await self.db.execute(
                select(Invoice)
                .where(and_(
                    Invoice.business_id == self.business_id,
                    Invoice.invoice_type == InvoiceType.SALE,
                ))
                .order_by(Invoice.created_at.desc())
                .limit(limit)
            )
            invoices = q.scalars().all()
            return [
                {
                    "id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "customer_name": inv.customer_name,
                    "total_amount": float(inv.total_amount or 0),
                    "status": inv.status,
                    "invoice_date": str(inv.invoice_date),
                }
                for inv in invoices
            ]
        except Exception as e:
            logger.error(f"Recent invoices query failed: {e}")
            return []

    async def _get_top_customers(self, limit: int = 5) -> list:
        if not self.business_id:
            return []
        try:
            from app.db.models.billing import Customer
            q = await self.db.execute(
                select(Customer)
                .where(Customer.business_id == self.business_id)
                .order_by(Customer.total_business.desc())
                .limit(limit)
            )
            customers = q.scalars().all()
            return [
                {"id": c.id, "name": c.name, "total_business": float(c.total_business or 0)}
                for c in customers
            ]
        except Exception as e:
            logger.error(f"Top customers query failed: {e}")
            return []

    async def _get_revenue_chart(self) -> list:
        """Last 6 months revenue per month."""
        if not self.business_id:
            return []
        try:
            from app.db.models.billing import Invoice, InvoiceStatus, InvoiceType
            results = []
            today = date.today()
            for i in range(5, -1, -1):
                month_start = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
                if i > 0:
                    d = today.replace(day=1)
                    for _ in range(i):
                        d = (d - timedelta(days=1)).replace(day=1)
                    month_start = d
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

                q = await self.db.execute(
                    select(func.coalesce(func.sum(Invoice.total_amount), 0)).where(
                        and_(
                            Invoice.business_id == self.business_id,
                            Invoice.invoice_type == InvoiceType.SALE,
                            Invoice.status == InvoiceStatus.PAID,
                            func.date(Invoice.invoice_date) >= month_start,
                            func.date(Invoice.invoice_date) <= month_end,
                        )
                    )
                )
                results.append({
                    "month": month_start.strftime("%b %Y"),
                    "revenue": float(q.scalar() or 0),
                })
            return results
        except Exception as e:
            logger.error(f"Chart query failed: {e}")
            return []

    async def _get_alerts(self) -> list:
        alerts = []
        if not self.business_id:
            return alerts
        try:
            from app.db.models.billing import Invoice, InvoiceStatus, InvoiceType
            today = date.today()

            # Overdue invoices
            q = await self.db.execute(
                select(func.count(Invoice.id)).where(
                    and_(
                        Invoice.business_id == self.business_id,
                        Invoice.status == InvoiceStatus.OVERDUE,
                        Invoice.invoice_type == InvoiceType.SALE,
                    )
                )
            )
            overdue_count = int(q.scalar() or 0)
            if overdue_count:
                alerts.append({
                    "type": "warning",
                    "icon": "⚠️",
                    "title": f"{overdue_count} Overdue Invoice{'s' if overdue_count > 1 else ''}",
                    "message": "Collect payment from customers to improve cash flow.",
                })

            # GST due reminder (20th of each month)
            if today.day >= 18:
                alerts.append({
                    "type": "info",
                    "icon": "📋",
                    "title": "GST Filing Due Soon",
                    "message": "GSTR-1 filing deadline is 20th of this month.",
                })
        except Exception as e:
            logger.error(f"Alerts query failed: {e}")

        return alerts

    async def get_charts(self, period: str = "this_month") -> dict:
        chart = await self._get_revenue_chart()
        return {"revenue_chart": chart}
