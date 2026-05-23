"""
FinFlow — Main FastAPI Application
AI-powered accounting platform for Indian small businesses.
Free-tier ready: runs on SQLite locally, PostgreSQL on Render/Neon.
"""
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

logger = logging.getLogger("finflow")


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"FinFlow {settings.APP_VERSION} starting ({settings.APP_ENV})")
    # Auto-create tables (SQLite dev) or use Alembic in production
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    yield
    logger.info("FinFlow shutting down")
    await engine.dispose()


# ── App ──────────────────────────────────────────────────────
app = FastAPI(
    title="FinFlow API",
    description="""
## FinFlow — AI-Powered Accounting for Indian Small Businesses

A modern alternative to Tally with AI-first features.

### Features
- 🧾 GST Billing & E-Invoicing
- 📦 Inventory Management
- 📊 Double-Entry Accounting
- 🤖 AI Accounting Assistant
- 💳 Payment Gateway (Razorpay)
- 📈 Reports & Analytics
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS ─────────────────────────────────────────────────────
def _parse_origins(raw: str) -> list:
    raw = raw.strip()
    if raw.startswith("["):
        try:
            return json.loads(raw)
        except Exception:
            pass
    return [o.strip().strip("\"'") for o in raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(settings.ALLOWED_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)


# ── Routes ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health endpoints ─────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/ping", tags=["Health"])
async def ping():
    """Keep-alive for Render free tier (use cron-job.org to ping every 14 min)."""
    return "pong"


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to FinFlow API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
