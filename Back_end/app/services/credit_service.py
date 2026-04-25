from sqlalchemy.orm import Session
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException, status
from app.models.all_models import User, CreditLedger, AIModel

class CreditService:
    @staticmethod
    def get_balance(db: Session, user_id: UUID) -> Decimal:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user.credit_balance

    @staticmethod
    def deduct_credits(
        db: Session, 
        user_id: UUID, 
        amount: Decimal, 
        reference_id: str, 
        transaction_type: str = "USAGE_DEDUCT"
    ) -> User:
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.credit_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient credit balance"
            )
            
        user.credit_balance -= amount
        
        # Log to ledger
        ledger_entry = CreditLedger(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=-amount,
            balance_after=user.credit_balance,
            reference_id=reference_id
        )
        db.add(ledger_entry)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def add_credits(
        db: Session, 
        user_id: UUID, 
        amount: Decimal, 
        reference_id: str, 
        transaction_type: str = "PURCHASE"
    ) -> User:
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.credit_balance += amount
        
        # Log to ledger
        ledger_entry = CreditLedger(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount,
            balance_after=user.credit_balance,
            reference_id=reference_id
        )
        db.add(ledger_entry)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def calculate_cost(tokens: int, model_name: str, db: Session) -> Decimal:
        # Fetch model cost from DB
        ai_model = db.query(AIModel).filter(AIModel.name == model_name).first()
        cost_per_1k = Decimal("0.00")
        if ai_model:
            cost_per_1k = ai_model.cost_per_1k_tokens
        else:
            # Fallback or default cost if model not found
            cost_per_1k = Decimal("0.01") # Default 0.01 per 1k tokens
            
        total_cost = (Decimal(tokens) / Decimal(1000)) * cost_per_1k
        return total_cost.quantize(Decimal("0.0001"))

    @staticmethod
    def auto_refresh_credits(db: Session):
        """
        Scheduled task to refresh credits based on billing cycle.
        Called by Celery Beat.
        """
        from datetime import datetime, timedelta
        from app.models.all_models import User
        
        # Fetch users whose last refresh was > 30 days ago and have an active plan
        cutoff = datetime.utcnow() - timedelta(days=30)
        users = db.query(User).filter(
            User.last_credit_refresh <= cutoff,
            User.plan_id.isnot(None)
        ).all()
        
        for user in users:
            plan = user.subscription_plan
            if not plan: continue
            
            # Reset balance to plan default
            old_balance = user.credit_balance
            user.credit_balance = Decimal(plan.credits_included)
            user.last_credit_refresh = datetime.utcnow()
            
            # Log to ledger
            ledger_entry = CreditLedger(
                user_id=user.id,
                transaction_type="PLAN_REFRESH",
                amount=user.credit_balance - old_balance,
                balance_after=user.credit_balance,
                reference_id=f"refresh_{datetime.utcnow().strftime('%Y%m%d')}"
            )
            db.add(ledger_entry)
            
        db.commit()

credit_service = CreditService()
