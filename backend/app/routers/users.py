import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User, UserStatus
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.booking import Booking, BookingStatus
from app.schemas.user import UserProfileResponse, UserUpdateRequest, CommunityMemberResponse
from app.schemas.skill import UserSkillAddRequest, UserSkillResponse
from app.dependencies import verify_token

router = APIRouter(prefix="/users", tags=["Users"])


def parse_availability(raw_val) -> List[str]:
    if not raw_val:
        return []
    if isinstance(raw_val, list):
        return raw_val
    try:
        if isinstance(raw_val, str) and raw_val.startswith("["):
            parsed = json.loads(raw_val)
            return parsed if isinstance(parsed, list) else []
        return [raw_val]
    except Exception:
        return []


def _build_profile_response(user: User) -> UserProfileResponse:
    return UserProfileResponse(
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
        rating=user.rating if user.rating is not None else 5.0,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )


def _get_swaps_count(db: Session, user_id: int) -> int:
    return (
        db.query(func.count(Booking.booking_id))
        .filter(
            Booking.status == BookingStatus.COMPLETED,
            (Booking.requester_id == user_id) | (Booking.provider_id == user_id),
        )
        .scalar()
        or 0
    )


@router.get("", response_model=List[CommunityMemberResponse])
def list_community_members(db: Session = Depends(get_db)):
    """
    List all active registered community members with their public profiles and skills.
    """
    users = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.status == UserStatus.ACTIVE)
        .order_by(User.created_at.desc())
        .all()
    )

    completed_counts = {}
    completed_bookings = db.query(Booking.requester_id, Booking.provider_id).filter(
        Booking.status == BookingStatus.COMPLETED
    ).all()
    for req_id, prov_id in completed_bookings:
        completed_counts[req_id] = completed_counts.get(req_id, 0) + 1
        completed_counts[prov_id] = completed_counts.get(prov_id, 0) + 1

    return [
        CommunityMemberResponse(
            user_id=u.user_id,
            name=u.name,
            role=u.role,
            avatar=u.avatar or "/default-avatar.svg",
            location=u.location or "Community Member",
            bio=u.bio or "",
            availability=parse_availability(u.availability),
            rating=u.rating if u.rating is not None else 5.0,
            swaps_count=completed_counts.get(u.user_id, 0),
            created_at=u.created_at,
            skills=[UserSkillResponse.model_validate(s) for s in u.user_skills],
        )
        for u in users
    ]


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Get profile information and skills for the authenticated user.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == current_user.user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )

    return _build_profile_response(user)


@router.put("/me", response_model=UserProfileResponse)
def update_current_user_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Update profile details for the authenticated user.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == current_user.user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if req.name is not None and req.name.strip():
        user.name = req.name.strip()
    if req.avatar is not None:
        user.avatar = req.avatar
    if req.location is not None:
        user.location = req.location.strip()
    if req.bio is not None:
        user.bio = req.bio
    if req.onboarding_completed is not None:
        user.onboarding_completed = 1 if req.onboarding_completed else 0
    if req.availability is not None:
        user.availability = json.dumps(req.availability)

    db.commit()
    db.refresh(user)

    return _build_profile_response(user)


@router.post("/me/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_user_skill(
    req: UserSkillAddRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Associate a skill (offering or seeking) with the current user.
    """
    skill = db.query(Skill).filter(Skill.skill_id == req.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in catalog.",
        )

    existing = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id == req.skill_id,
            UserSkill.type == req.type,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already added '{skill.name}' as a {req.type.value} skill.",
        )

    new_user_skill = UserSkill(
        user_id=current_user.user_id,
        skill_id=req.skill_id,
        type=req.type,
        proficiency=req.proficiency,
    )
    db.add(new_user_skill)
    db.commit()
    db.refresh(new_user_skill)

    new_user_skill.skill = skill
    return UserSkillResponse.model_validate(new_user_skill)


@router.delete("/me/skills/{id}", status_code=status.HTTP_200_OK)
def remove_user_skill(
    id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Remove an associated skill by its user_skill ID.
    """
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.id == id, UserSkill.user_id == current_user.user_id)
        .first()
    )
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User skill not found or does not belong to you.",
        )

    db.delete(user_skill)
    db.commit()
    return {"message": "Skill removed successfully"}


@router.get("/{user_id}", response_model=CommunityMemberResponse)
def get_community_member(user_id: int, db: Session = Depends(get_db)):
    """
    Get public profile for an active registered community member.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == user_id, User.status == UserStatus.ACTIVE)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community member not found.",
        )

    return CommunityMemberResponse(
        user_id=user.user_id,
        name=user.name,
        role=user.role,
        avatar=user.avatar or "/default-avatar.svg",
        location=user.location or "Community Member",
        bio=user.bio or "",
        availability=parse_availability(user.availability),
        rating=user.rating if user.rating is not None else 5.0,
        swaps_count=_get_swaps_count(db, user.user_id),
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )
