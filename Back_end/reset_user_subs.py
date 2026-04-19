from app.db.session import SessionLocal
from app.models.all_models import User

def reset_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            user.credit_balance = 0.0
            user.plan_id = None
        db.commit()
        print(f"Successfully reset {len(users)} users. All users now have 0 credits and No Plan.")
    except Exception as e:
        print(f"Error resetting users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_users()
