from uuid import uuid4
from app.db.session import SessionLocal
from app.models.all_models import User
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@udyame.ai").first()
        if not admin:
            admin = User(
                id=uuid4(),
                email="admin@udyame.ai",
                password_hash=get_password_hash("admin123"),
                full_name="System Admin",
                role="ADMIN",
                is_verified=True,
                credit_balance=99999
            )
            db.add(admin)
            db.commit()
            print("Admin user created successfully!")
            print("Email: admin@udyame.ai")
            print("Password: admin123")
        else:
            print("Admin user already exists.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
