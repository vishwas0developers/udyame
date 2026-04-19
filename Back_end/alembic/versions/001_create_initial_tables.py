"""create initial tables

Revision ID: 001
Revises: 
Create Date: 2024-04-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: str = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('verification_token', sa.String(length=100), nullable=True),
        sa.Column('subscription_tier', sa.String(length=50), nullable=True),
        sa.Column('credit_balance', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('last_credit_refresh', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create companies table
    op.create_table('companies',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=100), nullable=True),
        sa.Column('region', sa.String(length=100), nullable=True),
        sa.Column('legal_structure', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create internal_plannings table
    op.create_table('internal_plannings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('core_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id')
    )

    # Create question_bank table
    op.create_table('question_bank',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('text', sa.String(length=1000), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('industry_tag', sa.String(length=100), nullable=True),
        sa.Column('embedding', Vector(1024), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('approval_count', sa.Integer(), nullable=True),
        sa.Column('created_by', sa.String(length=50), nullable=True),
        sa.Column('admin_approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['admin_approved_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create ai_models table
    op.create_table('ai_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=True),
        sa.Column('api_endpoint', sa.String(length=500), nullable=True),
        sa.Column('model_id', sa.String(length=100), nullable=False),
        sa.Column('cost_per_1k_tokens', sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('fallback_priority', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create credit_ledger table
    op.create_table('credit_ledger',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('transaction_type', sa.String(length=20), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('balance_after', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('reference_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('credit_ledger')
    op.drop_table('ai_models')
    op.drop_table('question_bank')
    op.drop_table('internal_plannings')
    op.drop_table('companies')
    op.drop_table('users')