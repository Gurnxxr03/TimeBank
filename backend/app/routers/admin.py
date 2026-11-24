import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.skill import Skill
from app.models.user_skill import UserSkill, SkillType
from app.models.booking import Booking, BookingStatus
from app.schemas.user import UserStatusUpdateRequest
from app.schemas.skill import UserSkillResponse
from app.schemas.admin import (
    AdminUserItemResponse,
    AdminUserListResponse,
    AdminUserDetailResponse,
    AdminStatsResponse,
    UserRoleUpdateRequest,
    AdminCreditAdjustRequest,
)
from app.routers.users import parse_availability
from app.dependencies import verify_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(verify_admin)])


def _build_admin_detail(db: Session, user: User) -> AdminUserDetailResponse:
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.requester), joinedload(Booking.provider))
        .filter((Booking.requester_id == user.user_id) | (Booking.provider_id == user.user_id))
        .order_by(Booking.created_at.desc())
        .limit(20)
        .all()
    )
    return AdminUserDetailResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        avatar=user.avatar or "/default-avatar.svg",
        location=user.location or "Community Member",
        bio=user.bio or "",
        time_credits=user.time_credits if user.time_credits is not None else 10.0,
        in_escrow=user.in_escrow if user.in_escrow is not None else 0.0,
        lifetime_earned=user.lifetime_earned if user.lifetime_earned is not None else 0.0,
        lifetime_spent=user.lifetime_spent if user.lifetime_spent is not None else 0.0,
        onboarding_completed=bool(user.onboarding_completed),
        availability=parse_availability(user.availability),
        rating=user.rating,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
        bookings=bookings,
    )


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[UserStatus] = Query(None),
    role_filter: Optional[UserRole] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Get paginated users list with search, status/role filtering,
    and full profile, credit, and skill count metrics.
    """
    query = db.query(User)

    if search:
        search_term = f"%{search.lower().strip()}%"
        query = query.filter(
            (func.lower(User.name).like(search_term))
            | (func.lower(User.email).like(search_term))
            | (func.lower(User.location).like(search_term))
        )

    if status_filter:
        query = query.filter(User.status == status_filter)

    if role_filter:
        query = query.filter(User.role == role_filter)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = []
    for u in users:
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == u.user_id).all()
        offering_cnt = sum(1 for s in user_skills if s.type == SkillType.OFFERING)
        seeking_cnt = sum(1 for s in user_skills if s.type == SkillType.SEEKING)
        bookings_cnt = (
            db.query(func.count(Booking.booking_id))
            .filter((Booking.requester_id == u.user_id) | (Booking.provider_id == u.user_id))
            .scalar()
            or 0
        )

        items.append(
            AdminUserItemResponse(
                user_id=u.user_id,
                name=u.name,
                email=u.email,
                role=u.role,
                status=u.status,
                auth_provider=u.auth_provider,
                avatar=u.avatar or "/default-avatar.svg",
                location=u.location or "Community Member",
                time_credits=u.time_credits if u.time_credits is not None else 10.0,
                in_escrow=u.in_escrow if u.in_escrow is not None else 0.0,
                lifetime_earned=u.lifetime_earned if u.lifetime_earned is not None else 0.0,
                lifetime_spent=u.lifetime_spent if u.lifetime_spent is not None else 0.0,
                onboarding_completed=bool(u.onboarding_completed),
                rating=u.rating,
                created_at=u.created_at,
                skills_count=len(user_skills),
                offering_count=offering_cnt,
                seeking_count=seeking_cnt,
                bookings_count=bookings_cnt,
            )
        )

    return AdminUserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/users/{id}", response_model=AdminUserDetailResponse)
def get_user_detail(
    id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Get full profile details, wallet metrics, skill associations, and bookings for a specific user.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {id} not found.",
        )

    return _build_admin_detail(db, user)


@router.put("/users/{id}/status", response_model=AdminUserDetailResponse)
def update_user_status(
    id: int,
    req: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Update a user's account status (active or banned).
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {id} not found.",
        )

    if user.user_id == admin_user.user_id and req.status == UserStatus.BANNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot ban your own administrator account.",
        )

    user.status = req.status
    db.commit()
    db.refresh(user)

    return _build_admin_detail(db, user)


@router.put("/users/{id}/role", response_model=AdminUserDetailResponse)
def update_user_role(
    id: int,
    req: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Promote or demote a user's role (user / admin).
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {id} not found.",
        )

    if user.user_id == admin_user.user_id and req.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove admin privileges from your own account.",
        )

    user.role = req.role
    db.commit()
    db.refresh(user)

    return _build_admin_detail(db, user)


@router.put("/users/{id}/credits", response_model=AdminUserDetailResponse)
def adjust_user_credits(
    id: int,
    req: AdminCreditAdjustRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Update a user's Time Credits balance.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {id} not found.",
        )

    user.time_credits = round(req.time_credits, 2)
    db.commit()
    db.refresh(user)

    return _build_admin_detail(db, user)


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Get aggregated system metrics: user counts, credits, bookings, and skill counts.
    """
    total_users = db.query(func.count(User.user_id)).scalar() or 0
    active_users = db.query(func.count(User.user_id)).filter(User.status == UserStatus.ACTIVE).scalar() or 0
    banned_users = db.query(func.count(User.user_id)).filter(User.status == UserStatus.BANNED).scalar() or 0
    admin_users = db.query(func.count(User.user_id)).filter(User.role == UserRole.ADMIN).scalar() or 0

    total_skills = db.query(func.count(Skill.skill_id)).scalar() or 0
    offered_skills = db.query(func.count(UserSkill.id)).filter(UserSkill.type == SkillType.OFFERING).scalar() or 0
    sought_skills = db.query(func.count(UserSkill.id)).filter(UserSkill.type == SkillType.SEEKING).scalar() or 0

    total_credits = db.query(func.coalesce(func.sum(User.time_credits), 0.0)).scalar() or 0.0
    total_escrow = db.query(func.coalesce(func.sum(User.in_escrow), 0.0)).scalar() or 0.0
    total_bookings = db.query(func.count(Booking.booking_id)).scalar() or 0
    completed_bookings = (
        db.query(func.count(Booking.booking_id))
        .filter(Booking.status == BookingStatus.COMPLETED)
        .scalar()
        or 0
    )

    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        banned_users=banned_users,
        admin_users=admin_users,
        total_skills_catalog=total_skills,
        total_skills_offered=offered_skills,
        total_skills_sought=sought_skills,
        total_credits_in_circulation=round(float(total_credits), 2),
        total_credits_in_escrow=round(float(total_escrow), 2),
        total_bookings=total_bookings,
        completed_bookings=completed_bookings,
    )
