"""
FinFlow - Main FastAPI Application
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

ADMIN_EMAIL = "pratapsinghshivendra21@gmail.com"
ADMIN_PASSWORD = "FinFlow@123"
ADMIN_NAME = "Shivendra Pratap"


# -- Lifespan --
async def _seed_admin():
    """Ensure admin account exists with correct password on every boot."""
    import base64
    import hashlib
    import bcrypt
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import select
    from app.db.models.user import User, Business, BusinessMember, UserRole, AuthProvider

    def hash_pw(password: str) -> str:
        digest = base64.b64encode(hashlib.sha256(password.encode()).digest())
        return bcrypt.hashpw(digest, bcrypt.gensalt()).decode()

    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as db:
        # Check if admin already exists
        result = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        user = result.scalar_one_or_none()
        hashed = hash_pw(ADMIN_PASSWORD)

        if user:
            # Refresh password every boot so it always matches
            user.hashed_password = hashed
            user.is_verified = True
            user.is_active = True
            user.auth_provider = AuthProvider.EMAIL
            await db.commit()
            logger.info("Admin password refreshed for %s", ADMIN_EMAIL)
            return

        # First boot — create user, business, membership via ORM
        user = User(
            email=ADMIN_EMAIL,
            full_name=ADMIN_NAME,
            hashed_password=hashed,
            auth_provider=AuthProvider.EMAIL,
            is_verified=True,
            is_active=True,
            language="en",
        )
        db.add(user)
        await db.flush()

        business = Business(name="My Business")
        db.add(business)
        await db.flush()

        membership = BusinessMember(
            user_id=user.id,
            business_id=business.id,
            role=UserRole.OWNER,
            is_default=True,
        )
        db.add(membership)
        await db.commit()
        logger.info("Admin account created: %s", ADMIN_EMAIL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"FinFlow {settings.APP_VERSION} starting ({settings.APP_ENV})")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    try:
        await _seed_admin()
    except Exception as e:
        logger.warning(f"Seed skipped: {e}")
    yield
    logger.info("FinFlow shutting down")
    await engine.dispose()


# -- App --
app = FastAPI(
    title="FinFlow API",
    description="FinFlow - AI-Powered Accounting for Indian Small Businesses",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# -- CORS --
def _parse_origins(raw: str) -> list:
    raw = raw.strip()
    if not raw:
        return ["*"]
    if raw == "*":
        return ["*"]
    if raw.startswith("["):
        try:
            return json.loads(raw)
        except Exception:
            pass
    return [o.strip().strip("\"'") for o in raw.split(",") if o.strip()]


_origins = _parse_origins(settings.ALLOWED_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if "*" not in _origins else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)


# -- Routes --
app.include_router(api_router, prefix="/api/v1")


# -- Health endpoints --
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
