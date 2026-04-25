from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.services.credit_service import credit_service
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def refresh_credits_task():
    """
    Task wrapper for the credit refresh service.
    """
    db = SessionLocal()
    try:
        logger.info("Starting scheduled credit refresh...")
        credit_service.auto_refresh_credits(db)
        logger.info("Credit refresh completed successfully.")
    except Exception as e:
        logger.error(f"Credit refresh task failed: {e}")
    finally:
        db.close()
