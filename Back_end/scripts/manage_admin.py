import sys
import os
import getpass
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to allow imports of the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.all_models import User
from app.core import security

def manage_admin():
    print("--- Admin User Management Utility ---")
    email = input("Enter email address: ").strip()
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"[INFO] Found existing user: {user.full_name or 'N/A'}")
            print(f"[INFO] Current Role: {user.role}")
            
            action = input("Actions: (p)romote to admin, (r)eset password, (q)uit: ").lower()
            if action == 'p':
                user.role = "ADMIN"
                user.is_verified = True
                db.commit()
                print(f"[SUCCESS] {email} is now an ADMIN.")
            elif action == 'r':
                new_pass = getpass.getpass("Enter new password: ")
                user.password_hash = security.get_password_hash(new_pass)
                db.commit()
                print(f"[SUCCESS] Password updated for {email}.")
            else:
                print("[INFO] No changes made.")
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
    finally:
        db.close()

if __name__ == "__main__":
    manage_admin()
