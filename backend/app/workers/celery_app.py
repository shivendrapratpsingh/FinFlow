"""
FinFlow — Celery (optional background task queue).
If Redis / Celery is not installed, all tasks run inline (synchronously).
"""
import logging

logger = logging.getLogger("finflow.workers")

try:
    from celery import Celery
    from app.core.config import settings

    if settings.CELERY_BROKER_URL:
        celery_app = Celery(
            "finflow",
            broker=settings.CELERY_BROKER_URL,
            backend=settings.CELERY_RESULT_BACKEND or settings.CELERY_BROKER_URL,
        )
        celery_app.conf.update(
            task_serializer="json",
            accept_content=["json"],
            result_serializer="json",
            timezone="Asia/Kolkata",
            enable_utc=True,
        )
        CELERY_ENABLED = True
        logger.info("Celery connected to Redis")
    else:
        celery_app = None
        CELERY_ENABLED = False
        logger.info("Celery not configured — background tasks run inline")

except ImportError:
    celery_app = None
    CELERY_ENABLED = False
    logger.info("Celery not installed — background tasks run inline")
