"""003_add_bookings_table

Revision ID: 003_add_bookings
Revises: 002_user_profile_credits
Create Date: 2026-11-25 00:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_add_bookings'
down_revision: Union[str, None] = '002_user_profile_credits'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'bookings',
        sa.Column('booking_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('provider_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=True),
        sa.Column('skill_title', sa.String(length=200), nullable=False),
        sa.Column('scheduled_date', sa.String(length=100), nullable=False),
        sa.Column('scheduled_time', sa.String(length=100), nullable=False),
        sa.Column('format', sa.String(length=100), nullable=False, server_default='Online'),
        sa.Column('credits', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('status', sa.Enum('in_escrow', 'completed', 'cancelled', name='bookingstatus'), nullable=False, server_default='in_escrow'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['provider_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requester_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.skill_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('booking_id'),
    )
    op.create_index(op.f('ix_bookings_booking_id'), 'bookings', ['booking_id'], unique=False)
    op.create_index(op.f('ix_bookings_requester_id'), 'bookings', ['requester_id'], unique=False)
    op.create_index(op.f('ix_bookings_provider_id'), 'bookings', ['provider_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_bookings_provider_id'), table_name='bookings')
    op.drop_index(op.f('ix_bookings_requester_id'), table_name='bookings')
    op.drop_index(op.f('ix_bookings_booking_id'), table_name='bookings')
    op.drop_table('bookings')
