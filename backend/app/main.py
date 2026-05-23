"""
FinFlow — Main FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

try:
    import sentry_sdk
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

try:
    from prometheus_fastapi_instrumentator import Instrumentator
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware


# ── Sentry (production only) ─────────────────────────────────
if SENTRY_AVAILABLE and settings.SENTRY_DSN and settings.APP_ENV == "production":
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,
        environment=settings.APP_ENV,
    )


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print(f"🚀 FinFlow {settings.APP_VERSION} starting up...")
    async with engine.begin() as conn:
        # Create tables if they don't exist (use Alembic in production)
        if settings.APP_ENV == "development":
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    print("👋 FinFlow shutting down...")
    await engine.dispose()


# ── App Instance ─────────────────────────────────────────────
app = FastAPI(
    title="FinFlow API",
    description="""
    ## FinFlow — AI-Powered Accounting Platform for Small Businesses

    A modern, cloud-native alternative to Tally with AI-first features.

    ### Features
    - 🧾 Smart Billing & GST Invoicing
    - 📦 Inventory Management
    - 📊 Double-Entry Accounting
    - 🤖 AI Accounting Assistant
    - 🔍 OCR Document Scanning
    - 💳 Payment Gateway Integration
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ── Middleware ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

if settings.APP_ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["finflow.app", "*.finflow.app"],
    )


# ── Prometheus Metrics ───────────────────────────────────────
if PROMETHEUS_AVAILABLE:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# ── Routes ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health Check ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/ping", tags=["Health"])
async def ping():
    """Lightweight keep-alive endpoint. Use with cron-job.org to prevent Render sleep."""
    return "pong"


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to FinFlow API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
