"""
FinFlow - Application Configuration
Loads from .env file. All secrets are optional for local dev.
"""
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "FinFlow"
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"

    @property
    def DEBUG(self) -> bool:
        return self.APP_ENV == "development"

    # Database - defaults to SQLite locally, PostgreSQL on Render/Neon
    DATABASE_URL: str = "sqlite+aiosqlite:///./finflow.db"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis (optional)
    REDIS_URL: str = ""
    REDIS_CACHE_TTL: int = 3600

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://fin-flow-69zn.vercel.app"

    # AI (optional)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ChromaDB (optional)
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8008
    CHROMA_COLLECTION: str = "finflow_knowledge"

    # OCR (optional)
    GOOGLE_VISION_API_KEY: str = ""
    OCR_PROVIDER: str = "tesseract"

    # Payments (optional)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Email (optional)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@finflow.app"

    # SMS / WhatsApp (optional)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # Google OAuth (optional)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # AWS S3 (optional)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "finflow-documents"
    S3_ENDPOINT_URL: Optional[str] = None

    # Celery (optional)
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""

    # GST API (optional)
    GST_API_KEY: str = ""
    GST_API_BASE_URL: str = "https://api.gst.gov.in"

    # Monitoring (optional)
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
