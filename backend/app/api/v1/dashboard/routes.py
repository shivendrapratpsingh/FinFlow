"""
FinFlow — Dashboard Routes
Returns aggregated KPIs, charts, alerts, and AI insights.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.user import User

router = APIRouter()


@router.get("/")
async def get_dashboard(
    period: str = Query("this_month"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Main dashboard — KPIs, charts, alerts, AI insights."""
    from app.services.dashboard.dashboard_service import DashboardService
    service = DashboardService(db, current_user.active_business_id)
    return await service.get_dashboard(period)


@router.get("/kpis")
async def get_kpis(
    period: str = "this_month",
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """KPI cards: revenue, expenses, profit, GST payable."""
    from app.services.dashboard.dashboard_service import DashboardService
    service = DashboardService(db, current_user.active_business_id)
    return await service.get_kpis(period)


@router.get("/alerts")
async def get_alerts(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Smart alerts: overdue invoices, low stock, GST due dates."""
    from app.services.dashboard.alerts_service import AlertsService
    service = AlertsService(db, current_user.active_business_id)
    return await service.get_alerts()
