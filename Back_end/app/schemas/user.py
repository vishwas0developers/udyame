from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from app.schemas.subscription_plan import SubscriptionPlanOut

# User input for registration
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

# User output (sanitized)
class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    plan_id: Optional[UUID] = None
    subscription_plan: Optional[SubscriptionPlanOut] = None
    credit_balance: float
    created_at: datetime

    class Config:
        from_attributes = True

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
