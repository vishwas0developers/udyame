from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

class CreditBalance(BaseModel):
    user_id: UUID
    credit_balance: Decimal
    last_credit_refresh: datetime

    class Config:
        from_attributes = True

class CreditTransaction(BaseModel):
    id: UUID
    transaction_type: str
    amount: Decimal
    balance_after: Decimal
    reference_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CreditHistory(BaseModel):
    transactions: List[CreditTransaction]
    total_count: int
