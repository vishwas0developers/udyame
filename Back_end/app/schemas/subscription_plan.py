from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class SubscriptionPlanBase(BaseModel):
    name: str
    price: float
    credits_included: int
    features: List[str]
    is_active: bool = True
    is_recommended: bool = False

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    credits_included: Optional[int] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_recommended: Optional[bool] = None

class SubscriptionPlanOut(SubscriptionPlanBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
