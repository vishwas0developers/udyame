import sys
import os

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.all_models import Base, User
from seed_plans import seed_plans

def reset_database():
    print("--- Database Reset Utility ---")
    
    admin_backups = []
    
    # 1. Backup Admin Users
    print("[1/5] Backing up ADMIN accounts...")
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == "ADMIN").all()
        for admin in admins:
            admin_backups.append({
                "email": admin.email,
                "password_hash": admin.password_hash,
                "full_name": admin.full_name,
                "role": admin.role,
                "is_verified": admin.is_verified,
                "credit_balance": admin.credit_balance
            })
        print(f"      - Found {len(admin_backups)} admin(s) to preserve.")
    except Exception as e:
        print(f"      - Note: Table not found or access error (clean start): {e}")
    finally:
        db.close() # CRITICAL: Close session before dropping tables

    try:
        # 2. Drop all tables
        print("[2/5] Dropping all existing data...")
        Base.metadata.drop_all(bind=engine)
        
        # 3. Recreate tables
        print("[3/5] Recreating table structures...")
        Base.metadata.create_all(bind=engine)
        
        # 4. Seed plans
        print("[4/5] Re-seeding canonical plans...")
        seed_plans()
        
        # 5. Restore Admins
        if admin_backups:
            print("[5/5] Restoring ADMIN accounts...")
            db = SessionLocal()
            try:
                for data in admin_backups:
                    new_admin = User(**data)
                    db.add(new_admin)
                db.commit()
                print(f"      - Restored {len(admin_backups)} admin(s).")
            finally:
                db.close()
        else:
            print("[5/5] No admins to restore.")

        print("\n[SUCCESS] Database is now fresh. ADMIN accounts were preserved.")
    
    except Exception as e:
        print(f"\n[ERROR] Reset failed: {e}")
        raise e

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        sys.exit(1)
