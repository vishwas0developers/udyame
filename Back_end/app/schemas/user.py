from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

# User input for registration
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# User output (sanitized)
class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    subscription_tier: str
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
