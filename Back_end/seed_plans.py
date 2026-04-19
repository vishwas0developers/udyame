import uuid
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.all_models import SubscriptionPlan

def seed_plans():
    db = SessionLocal()
    try:
        # Clear existing plans to ensure exactly three
        db.query(SubscriptionPlan).delete()
        print("Cleared existing plans.")

        plans = [
            SubscriptionPlan(
                id=uuid.uuid4(),
                name="FREE",
                price=0.00,
                credits_included=50,
                features=["Conversational Planning", "1 Business Plan/mo", "Community Support"],
                is_active=True,
                is_recommended=False
            ),
            SubscriptionPlan(
                id=uuid.uuid4(),
                name="PRO",
                price=999.00,
                credits_included=500,
                features=["Everything in FREE", "Unlimited Planning", "Priority AI Responses", "PDF Export"],
                is_active=True,
                is_recommended=True
            ),
            SubscriptionPlan(
                id=uuid.uuid4(),
                name="BUSINESS",
                price=2999.00,
                credits_included=1500,
                features=["Everything in PRO", "Team Collaboration", "Custom Templates", "Advanced Analytics"],
                is_active=True,
                is_recommended=False
            )
        ]
        
        db.add_all(plans)
        db.commit()
        print("Success: Seeded the 3 canonical plans: FREE, PRO, BUSINESS.")
    except Exception as e:
        print(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_plans()
