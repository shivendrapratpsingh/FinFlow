"""
FinFlow — Celery Background Task Queue
Tasks: PDF generation, email sending, OCR processing,
       payment reminders, report generation.
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "finflow",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.tasks.invoice_tasks",
        "app.workers.tasks.notification_tasks",
        "app.workers.tasks.report_tasks",
        "app.workers.tasks.ocr_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.tasks.invoice_tasks.*": {"queue": "invoices"},
        "app.workers.tasks.notification_tasks.*": {"queue": "notifications"},
        "app.workers.tasks.report_tasks.*": {"queue": "reports"},
        "app.workers.tasks.ocr_tasks.*": {"queue": "ocr"},
    },
)

# ── Scheduled Tasks ───────────────────────────────────────────
celery_app.conf.beat_schedule = {
    # Send payment reminders daily at 9 AM
    "send-payment-reminders": {
        "task": "app.workers.tasks.notification_tasks.send_overdue_reminders",
        "schedule": crontab(hour=9, minute=0),
    },
    # Generate daily cash flow summary
    "daily-cashflow-summary": {
        "task": "app.workers.tasks.report_tasks.generate_daily_summary",
        "schedule": crontab(hour=20, minute=0),
    },
    # Auto-backup financial data weekly
    "weekly-backup": {
        "task": "app.workers.tasks.report_tasks.backup_financial_data",
        "schedule": crontab(hour=2, minute=0, day_of_week="sunday"),
    },
    # GST filing reminders (20th of every month)
    "gst-filing-reminder": {
        "task": "app.workers.tasks.notification_tasks.gst_filing_reminder",
        "schedule": crontab(hour=10, minute=0, day_of_month="18,19,20"),
    },
}
