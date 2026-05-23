"""FinFlow — Dashboard Pydantic Schemas."""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from pydantic import BaseModel


class KPICard(BaseModel):
    label: str
    value: Decimal
    formatted: str          # "₹1,23,456"
    change_percent: float   # vs last period
    trend: str              # up | down | flat
    icon: str
    color: str


class KPIResponse(BaseModel):
    revenue: KPICard
    expenses: KPICard
    profit: KPICard
    gst_payable: KPICard
    outstanding: KPICard
    cash_balance: KPICard


class ChartDataPoint(BaseModel):
    label: str
    value: Decimal
    secondary_value: Optional[Decimal] = None


class AlertItem(BaseModel):
    type: str        # warning | info | danger | success
    title: str
    message: str
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    created_at: str


class RecentInvoice(BaseModel):
    id: str
    invoice_number: str
    customer_name: str
    amount: Decimal
    status: str
    date: str


class DashboardResponse(BaseModel):
    kpis: KPIResponse
    revenue_chart: List[ChartDataPoint]
    expense_chart: List[ChartDataPoint]
    recent_invoices: List[RecentInvoice]
    alerts: List[AlertItem]
    ai_insights: List[str]
    period: str
