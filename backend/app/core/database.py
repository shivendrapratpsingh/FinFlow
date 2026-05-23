"""
FinFlow — Async Database Setup
Supports both SQLite (local dev, zero config) and PostgreSQL (production).
"""
import re
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy import Column, DateTime, func, String
import uuid

from app.core.config import settings


def _prepare_db(raw: str):
    """
    Accept SQLite or any Postgres URL and return (url, connect_args, kwargs).
    - sqlite+aiosqlite:///./finflow.db  → local SQLite, no extra args
    - postgres://... / postgresql://... → asyncpg with optional SSL
    """
    url = raw.strip()

    # ── SQLite ───────────────────────────────────────────────
    if url.startswith("sqlite"):
        if "aiosqlite" not in url:
            url = url.replace("sqlite:///", "sqlite+aiosqlite:///")
        return url, {"check_same_thread": False}, {}

    # ── PostgreSQL ───────────────────────────────────────────
    needs_ssl = any(k in url for k in ("sslmode", "ssl=", "neon.tech", "channel_binding"))
    url = re.sub(r"[?&](sslmode|ssl|channel_binding|options)=[^&]*", "", url)
    url = url.rstrip("?&")

    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]

    connect_args = {"ssl": "require"} if needs_ssl else {}
    return url, connect_args, {}


_db_url, _connect_args, _extra_kwargs = _prepare_db(settings.DATABASE_URL)
_is_sqlite = "sqlite" in _db_url

# ── Engine ───────────────────────────────────────────────────
_engine_kwargs = {
    "connect_args": _connect_args,
    "pool_pre_ping": True,
    "echo": (settings.APP_ENV == "development"),
    "future": True,
    **_extra_kwargs,
}
# SQLite doesn't support pool_size / max_overflow
if not _is_sqlite:
    _engine_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
    _engine_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW

engine = create_async_engine(_db_url, **_engine_kwargs)

# ── Session Factory ──────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Base Model ───────────────────────────────────────────────
class Base(DeclarativeBase):

    @declared_attr
    def __tablename__(cls) -> str:
        name = cls.__name__
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ── Dependency ───────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
