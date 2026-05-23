"""
FinFlow — API V1 Router
Aggregates all module routers.
"""
from fastapi import APIRouter

from app.api.v1.auth.routes import router as auth_router
from app.api.v1.dashboard.routes import router as dashboard_router
from app.api.v1.billing.routes import router as billing_router
from app.api.v1.inventory.routes import router as inventory_router
from app.api.v1.accounting.routes import router as accounting_router
from app.api.v1.gst.routes import router as gst_router
from app.api.v1.reports.routes import router as reports_router
from app.api.v1.ai.routes import router as ai_router
from app.api.v1.payments.routes import router as payments_router

api_router = APIRouter()

api_router.include_router(auth_router,       prefix="/auth",       tags=["Authentication"])
api_router.include_router(dashboard_router,  prefix="/dashboard",  tags=["Dashboard"])
api_router.include_router(billing_router,    prefix="/billing",    tags=["Billing & Invoices"])
api_router.include_router(inventory_router,  prefix="/inventory",  tags=["Inventory"])
api_router.include_router(accounting_router, prefix="/accounting", tags=["Accounting"])
api_router.include_router(gst_router,        prefix="/gst",        tags=["GST & Tax"])
api_router.include_router(reports_router,    prefix="/reports",    tags=["Reports"])
api_router.include_router(ai_router,         prefix="/ai",         tags=["AI Assistant"])
api_router.include_router(payments_router,   prefix="/payments",   tags=["Payments"])
