import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to allow imports of the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.all_models import User

def cleanup_subscriptions():
    print("--- User Subscription Cleanup Utility ---")
    confirm = input("Are you sure you want to remove all users from their current plans? (y/n): ")
    if confirm.lower() != 'y':
        print("[INFO] Operation cancelled.")
        return

    db = SessionLocal()
    try:
        # Set all non-admin plan_id to NULL
        affected = db.query(User).filter(User.role != "ADMIN").update({User.plan_id: None})
        db.commit()
        print(f"[SUCCESS] Removed {affected} users from their current subscription plans.")
    except Exception as e:
        print(f"[ERROR] Cleanup failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_subscriptions()
