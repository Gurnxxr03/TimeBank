import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.skill import Skill
from app.models.user_skill import UserSkill, SkillType
from app.schemas.user import UserStatusUpdateRequest
from app.schemas.skill import UserSkillResponse
from app.schemas.admin import (
    AdminUserItemResponse,
    AdminUserListResponse,
    AdminUserDetailResponse,
    AdminStatsResponse,
)
from app.dependencies import verify_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(verify_admin)])


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[UserStatus] = Query(None),
    role_filter: Optional[UserRole] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Get paginated users list with search, status/role filtering,
    and skill count metrics.
    """
    query = db.query(User)

    if search:
        search_term = f"%{search.lower().strip()}%"
        query = query.filter(
            (func.lower(User.name).like(search_term)) | (func.lower(User.email).like(search_term))
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
        # Calculate skills counts for user
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == u.user_id).all()
        offering_cnt = sum(1 for s in user_skills if s.type == SkillType.OFFERING)
        seeking_cnt = sum(1 for s in user_skills if s.type == SkillType.SEEKING)

        items.append(
            AdminUserItemResponse(
                user_id=u.user_id,
                name=u.name,
                email=u.email,
                role=u.role,
                status=u.status,
                auth_provider=u.auth_provider,
                rating=u.rating,
                created_at=u.created_at,
                skills_count=len(user_skills),
                offering_count=offering_cnt,
                seeking_count=seeking_cnt,
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
    Get full profile details and skill associations for a specific user.
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

    return AdminUserDetailResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        rating=user.rating,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )


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

    return AdminUserDetailResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        rating=user.rating,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    """
    Get aggregated system metrics: user counts, status distribution, and skill counts.
    """
    total_users = db.query(func.count(User.user_id)).scalar() or 0
    active_users = db.query(func.count(User.user_id)).filter(User.status == UserStatus.ACTIVE).scalar() or 0
    banned_users = db.query(func.count(User.user_id)).filter(User.status == UserStatus.BANNED).scalar() or 0
    admin_users = db.query(func.count(User.user_id)).filter(User.role == UserRole.ADMIN).scalar() or 0

    total_skills = db.query(func.count(Skill.skill_id)).scalar() or 0
    offered_skills = db.query(func.count(UserSkill.id)).filter(UserSkill.type == SkillType.OFFERING).scalar() or 0
    sought_skills = db.query(func.count(UserSkill.id)).filter(UserSkill.type == SkillType.SEEKING).scalar() or 0

    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        banned_users=banned_users,
        admin_users=admin_users,
        total_skills_catalog=total_skills,
        total_skills_offered=offered_skills,
        total_skills_sought=sought_skills,
    )
