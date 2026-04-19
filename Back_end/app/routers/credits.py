from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User
from app.services.credit_service import credit_service
from app.schemas.credit import CreditBalance, CreditHistory, CreditTransaction

router = APIRouter()

@router.get("/balance", response_model=CreditBalance)
def get_balance(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current credit balance of the authenticated user.
    """
    return {
        "user_id": current_user.id,
        "credit_balance": current_user.credit_balance,
        "last_credit_refresh": current_user.last_credit_refresh
    }

@router.get("/history", response_model=CreditHistory)
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the transaction history for credits of the authenticated user.
    """
    transactions = credit_service.get_history(db, current_user.id, limit=limit)
    return {
        "transactions": transactions,
        "total_count": len(transactions)
    }
