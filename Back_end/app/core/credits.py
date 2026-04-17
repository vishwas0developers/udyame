from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.all_models import User, CreditLedger

def check_and_deduct_credits(
    db: Session, 
    user_id: str, 
    cost: Decimal, 
    reference_id: str,
    transaction_type: str = "USAGE_DEDUCT"
):
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.credit_balance < cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please refill your balance."
        )
    
    # Deduct
    user.credit_balance -= cost
    
    # Log transaction
    ledger_entry = CreditLedger(
        user_id=user.id,
        transaction_type=transaction_type,
        amount=-cost,
        balance_after=user.credit_balance,
        reference_id=reference_id
    )
    db.add(ledger_entry)
    db.commit()
    
    return user.credit_balance
