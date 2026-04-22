import sys
import os

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from app.models.all_models import Base
from seed_plans import seed_plans

def reset_database():
    print("--- Database Reset Utility ---")
    
    # 1. Drop all tables
    print("[1/3] Dropping all existing data...")
    Base.metadata.drop_all(bind=engine)
    
    # 2. Recreate tables
    print("[2/3] Recreating table structures...")
    Base.metadata.create_all(bind=engine)
    
    # 3. Seed plans
    print("[3/3] Re-seeding canonical plans...")
    seed_plans()
    
    print("\n[SUCCESS] Database is now fresh and ready for testing.")

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        print(f"\n[ERROR] Reset failed: {e}")
        sys.exit(1)
