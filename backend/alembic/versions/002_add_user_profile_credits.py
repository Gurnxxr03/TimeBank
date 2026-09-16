"""002_add_user_profile_credits

Revision ID: 002_user_profile_credits
Revises: 001_phase1_initial
Create Date: 2026-09-17 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_user_profile_credits'
down_revision: Union[str, None] = '001_phase1_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add google_sub column and copy google_id if existing
    op.add_column('users', sa.Column('google_sub', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_google_sub'), 'users', ['google_sub'], unique=True)
    
    # 2. Add profile & credit columns
    op.add_column('users', sa.Column('avatar', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(length=255), nullable=True, server_default='Community Member'))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('time_credits', sa.Float(), nullable=False, server_default='10.0'))
    op.add_column('users', sa.Column('in_escrow', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('users', sa.Column('lifetime_earned', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('users', sa.Column('lifetime_spent', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('availability', sa.Text(), nullable=True))

    # Copy google_id into google_sub for existing records
    op.execute("UPDATE users SET google_sub = google_id WHERE google_id IS NOT NULL")


def downgrade() -> None:
    op.drop_column('users', 'availability')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'lifetime_spent')
    op.drop_column('users', 'lifetime_earned')
    op.drop_column('users', 'in_escrow')
    op.drop_column('users', 'time_credits')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'location')
    op.drop_column('users', 'avatar')
    op.drop_index(op.f('ix_users_google_sub'), table_name='users')
    op.drop_column('users', 'google_sub')
