from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.routers.deps import get_current_user
from app.models.all_models import User, Company, SubscriptionPlan
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate

router = APIRouter()

@router.post("/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(
    company_in: CompanyCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new company workspace.
    Enforces plan-tier limits: FREE=1, PRO=3, BUSINESS/ENTERPRISE=unlimited.
    """
    # 1. Check existing company count
    count = db.query(Company).filter(Company.user_id == current_user.id).count()
    
    # 2. Determine limit based on plan
    plan_name = "FREE"
    if current_user.subscription_plan:
        plan_name = current_user.subscription_plan.name.upper()
    
    limit = 1
    if "PRO" in plan_name:
        limit = 3
    elif any(kw in plan_name for kw in ["BUSINESS", "ENTERPRISE", "UNLIMITED"]):
        limit = 9999
        
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Workspace limit reached for {plan_name} plan ({limit} max). Please upgrade."
        )

    # 3. Create
    company = Company(
        **company_in.model_dump(),
        user_id=current_user.id
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/", response_model=List[CompanyRead])
def list_companies(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Lists all company workspaces owned by the current user.
    """
    return db.query(Company).filter(Company.user_id == current_user.id).all()

@router.get("/{company_id}", response_model=CompanyRead)
def get_company(
    company_id: UUID,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves a specific company workspace.
    """
    company = db.query(Company).filter(
        Company.id == company_id, 
        Company.user_id == current_user.id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company workspace not found")
    return company

@router.patch("/{company_id}", response_model=CompanyRead)
def update_company(
    company_id: UUID,
    company_in: CompanyUpdate,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Updates company workspace details.
    """
    company = db.query(Company).filter(
        Company.id == company_id, 
        Company.user_id == current_user.id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company workspace not found")
    
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: UUID,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a company workspace.
    """
    company = db.query(Company).filter(
        Company.id == company_id, 
        Company.user_id == current_user.id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company workspace not found")
    
    db.delete(company)
    db.commit()
    return None
