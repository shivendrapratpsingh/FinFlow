"""
FinFlow — Application Configuration
Loads settings from environment variables with validation.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "FinFlow"
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"

    @property
    def DEBUG(self) -> bool:
        return self.APP_ENV == "development"

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Normalize any Postgres URL to postgresql+asyncpg:// format."""
        url = self.DATABASE_URL.strip()
        # Remove unsupported asyncpg params
        url = url.replace("channel_binding=require", "").replace("sslmode=require", "ssl=require")
        url = url.replace("&&", "&").replace("?&", "?").rstrip("?&")
        # Fix scheme
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        elif not url.startswith("postgresql+asyncpg://"):
            url = "postgresql+asyncpg://" + url
        return url

    # ── Redis ────────────────────────────────────────────────
    REDIS_URL: str = ""
    REDIS_CACHE_TTL: int = 3600

    # ── Security ─────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── CORS — stored as plain string, parsed in main.py ─────
    # Set in Render as:  https://your-app.vercel.app,http://localhost:3000
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── AI ───────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ── ChromaDB ─────────────────────────────────────────────
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8008
    CHROMA_COLLECTION: str = "finflow_knowledge"

    # ── OCR ──────────────────────────────────────────────────
    GOOGLE_VISION_API_KEY: str = ""
    OCR_PROVIDER: str = "tesseract"

    # ── Payments ─────────────────────────────────────────────
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ── Email ────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@finflow.app"

    # ── SMS ──────────────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # ── WhatsApp ─────────────────────────────────────────────
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # ── Google OAuth ─────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # ── AWS S3 ───────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "finflow-documents"
    S3_ENDPOINT_URL: Optional[str] = None

    # ── Celery ───────────────────────────────────────────────
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""

    # ── GST API ──────────────────────────────────────────────
    GST_API_KEY: str = ""
    GST_API_BASE_URL: str = "https://api.gst.gov.in"

    # ── Monitoring ───────────────────────────────────────────
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
