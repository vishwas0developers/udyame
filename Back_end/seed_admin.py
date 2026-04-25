import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.all_models import User
from app.core import security

def seed_admin():
    print("--- Admin Seeding Utility ---")
    email = "admin@udyame.ai"
    password = "admin123"
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"[INFO] User {email} already exists.")
            if user.role != "ADMIN":
                user.role = "ADMIN"
                db.commit()
                print(f"[SUCCESS] Updated {email} to ADMIN role.")
        else:
            print(f"[PROCESS] Creating default admin: {email}...")
            new_user = User(
                email=email,
                password_hash=security.get_password_hash(password),
                full_name="System Administrator",
                role="ADMIN",
                is_verified=True
            )
            db.add(new_user)
            db.commit()
            print(f"[SUCCESS] Created default admin account: {email}")
            
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
