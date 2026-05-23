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
    import uuid
    import base64
    import hashlib
    import bcrypt
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import text

    def hash_pw(password: str) -> str:
        digest = base64.b64encode(hashlib.sha256(password.encode()).digest())
        return bcrypt.hashpw(digest, bcrypt.gensalt()).decode()

    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as db:
        # Check if admin already exists
        row = await db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": ADMIN_EMAIL},
        )
        existing = row.fetchone()

        hashed = hash_pw(ADMIN_PASSWORD)

        if existing:
            # Always refresh the admin password so it matches our seed
            await db.execute(
                text(
                    "UPDATE users SET hashed_password = :pwd, is_verified = true, "
                    "is_active = true, auth_provider = :provider WHERE email = :email"
                ),
                {"pwd": hashed, "provider": "email", "email": ADMIN_EMAIL},
            )
            await db.commit()
            logger.info("Admin password refreshed for %s", ADMIN_EMAIL)
            return

        # First boot — create everything from scratch
        user_id = str(uuid.uuid4())
        biz_id = str(uuid.uuid4())
        mem_id = str(uuid.uuid4())

        await db.execute(
            text(
                "INSERT INTO users "
                "(id, email, full_name, hashed_password, is_verified, "
                "is_active, auth_provider, language, created_at, updated_at) "
                "VALUES (:id, :email, :name, :pwd, true, true, :provider, :lang, "
                "CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {
                "id": user_id,
                "email": ADMIN_EMAIL,
                "name": ADMIN_NAME,
                "pwd": hashed,
                "provider": "email",
                "lang": "en",
            },
        )

        await db.execute(
            text(
                "INSERT INTO businesses (id, name, created_at, updated_at) "
                "VALUES (:id, :name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"id": biz_id, "name": "My Business"},
        )

        await db.execute(
            text(
                "INSERT INTO business_members "
                "(id, user_id, business_id, role, is_default, created_at, updated_at) "
                "VALUES (:id, :uid, :bid, :role, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"id": mem_id, "uid": user_id, "bid": biz_id, "role": "owner"},
        )

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
