"""
FinFlow — Async Database Setup (SQLAlchemy + asyncpg)
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy import Column, DateTime, func, String
import uuid

from app.core.config import settings


# ── Engine ───────────────────────────────────────────────────
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    echo=(settings.APP_ENV == "development"),
    future=True,
)

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
    """Base class for all SQLAlchemy models."""

    @declared_attr
    def __tablename__(cls) -> str:
        """Auto-generate table name from class name."""
        import re
        name = cls.__name__
        # CamelCase → snake_case
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
    """FastAPI dependency that provides a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
