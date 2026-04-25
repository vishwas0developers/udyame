import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.all_models import User

def ensure_admin():
    print("--- Admin Access Verification Utility ---")
    email = input("Enter the email to verify/promote: ").strip()
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"[ERROR] User with email {email} not found in database.")
            print("[HINT] Please sign up on the frontend first.")
            return

        print(f"[INFO] User Found: {user.full_name or 'N/A'}")
        print(f"[INFO] Current Role: {user.role}")
        
        if user.role != "ADMIN":
            confirm = input(f"Promote {email} to ADMIN? (y/n): ")
            if confirm.lower() == 'y':
                user.role = "ADMIN"
                user.is_verified = True
                db.commit()
                print(f"[SUCCESS] {email} has been promoted to ADMIN.")
            else:
                print("[INFO] No changes made.")
        else:
            print(f"[INFO] {email} already has ADMIN privileges.")
            
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ensure_admin()
