import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime
from app.models.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), nullable=True)
    subscription_tier = Column(String(50), default="FREE")
    credit_balance = Column(Numeric(10, 2), default=0.00)
    last_credit_refresh = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    companies = relationship("Company", back_populates="owner", cascade="all, delete-orphan")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    provider = Column(String(50), nullable=False) # e.g., 'google'
    provider_user_id = Column(String(255), nullable=False, unique=True)
    user = relationship("User", back_populates="oauth_accounts")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    user = relationship("User", back_populates="refresh_tokens")

class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    industry = Column(String(100))
    region = Column(String(100))
    legal_structure = Column(String(50))
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="companies")
    planning = relationship("InternalPlanning", back_populates="company", uselist=False, cascade="all, delete-orphan")

class InternalPlanning(Base):
    __tablename__ = "internal_plannings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), unique=True)
    core_data = Column(JSONB, nullable=False)  # Stores questions & answers
    status = Column(String(20), default="DRAFT")
    completed_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="planning")

class QuestionBank(Base):
    __tablename__ = "question_bank"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String(1000), nullable=False)
    category = Column(String(50))  # PERMANENT, CONTEXTUAL, SELF_LEARNED
    industry_tag = Column(String(100))
    embedding = Column(Vector(1024))  # multilingual-e5-large
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    approval_count = Column(Integer, default=0)
    created_by = Column(String(50), default="AI")
    admin_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIModel(Base):
    __tablename__ = "ai_models"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    provider = Column(String(50))  # openai, gemini, qwen, etc.
    api_endpoint = Column(String(500), nullable=True)
    model_id = Column(String(100), nullable=False)
    cost_per_1k_tokens = Column(Numeric(10, 4), default=0.0000)
    is_active = Column(Boolean, default=True)
    fallback_priority = Column(Integer, default=99)
    created_at = Column(DateTime, default=datetime.utcnow)

class CreditLedger(Base):
    __tablename__ = "credit_ledger"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    transaction_type = Column(String(20))  # PLAN_ALLOC, USAGE_DEDUCT, REFUND, PURCHASE
    amount = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    reference_id = Column(String(100))  # session_id, model_id, payment_id
    created_at = Column(DateTime, default=datetime.utcnow)
