import sys
import os
import getpass
from sqlalchemy.orm import Session

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.all_models import User
from app.core import security

def create_admin():
    print("--- Admin User Creation/Promotion Utility ---")
    email = input("Enter email address: ").strip()
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"[INFO] Found existing user: {user.full_name or 'N/A'}")
            confirm = input("Promote this user to ADMIN? (y/n): ")
            if confirm.lower() == 'y':
                user.role = "ADMIN"
                user.is_verified = True
                db.commit()
                print(f"[SUCCESS] {email} is now an ADMIN.")
            else:
                print("[INFO] Operation cancelled.")
        else:
            print(f"[INFO] User {email} not found. Creating new admin account...")
            password = getpass.getpass("Enter password: ")
            full_name = input("Enter full name: ")
            
            new_user = User(
                email=email,
                password_hash=security.get_password_hash(password),
                full_name=full_name,
                role="ADMIN",
                is_verified=True
            )
            db.add(new_user)
            db.commit()
            print(f"[SUCCESS] Created new ADMIN account: {email}")
            
    except Exception as e:
        print(f"[ERROR] Operation failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
