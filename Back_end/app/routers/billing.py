from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.all_models import User, SubscriptionPlan
from app.schemas.subscription_plan import SubscriptionPlanOut, SubscriptionPlanUpdate, SubscriptionPlanCreate
from app.core import security

router = APIRouter()

@router.get("/plans", response_model=List[SubscriptionPlanOut])
def get_plans(db: Session = Depends(get_db)):
    """Fetch all active subscription plans."""
    return db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()

@router.post("/me/plan/{plan_id}")
def select_plan(
    plan_id: UUID, 
    user_id: str = Depends(security.get_current_user_id), 
    db: Session = Depends(get_db)
):
    """Assign a subscription plan to the current user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")
    
    user.plan_id = plan.id
    # Optionally initialize credits if it's a new subscription
    user.credit_balance = plan.credits_included
    
    db.commit()
    db.refresh(user)
    return {"message": f"Successfully subscribed to {plan.name}", "plan": plan.name}

# Admin Routes
@router.get("/admin/plans", response_model=List[SubscriptionPlanOut])
def admin_get_all_plans(
    user_id: str = Depends(security.get_current_user_id), 
    db: Session = Depends(get_db)
):
    # Proper admin check logic
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    return db.query(SubscriptionPlan).all()

@router.post("/admin/plans", response_model=SubscriptionPlanOut)
def admin_create_plan(
    plan_in: SubscriptionPlanCreate,
    user_id: str = Depends(security.get_current_user_id),
    db: Session = Depends(get_db)
):
    # TODO: Add proper admin check logic
    plan = SubscriptionPlan(**plan_in.dict())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.patch("/admin/plans/{plan_id}", response_model=SubscriptionPlanOut)
def admin_update_plan(
    plan_id: UUID,
    plan_in: SubscriptionPlanUpdate,
    user_id: str = Depends(security.get_current_user_id),
    db: Session = Depends(get_db)
):
    # TODO: Add proper admin check logic
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    update_data = plan_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    return plan
