from celery import Celery
from app.core.config import settings

# Celery instance using centralized settings
celery_app = Celery(
    "udyame",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
)

# Auto-discover tasks from app.tasks and existing services
celery_app.autodiscover_tasks(["app.tasks", "app.services"])

# Periodic Task Schedule (Beat)
celery_app.conf.beat_schedule = {
    "daily-credit-refresh": {
        "task": "app.tasks.credit_tasks.refresh_credits_task",
        "schedule": 86400.0, # Every 24 hours
    },
}
