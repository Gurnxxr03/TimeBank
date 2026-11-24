from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User, UserStatus
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.dependencies import verify_token

router = APIRouter(prefix="/bookings", tags=["Bookings & Escrow"])


def _load_booking(db: Session, booking_id: int) -> Booking | None:
    return (
        db.query(Booking)
        .options(joinedload(Booking.requester), joinedload(Booking.provider))
        .filter(Booking.booking_id == booking_id)
        .first()
    )


@router.get("/me", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    List all skill exchange bookings where the current user is requester or provider.
    """
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.requester), joinedload(Booking.provider))
        .filter(
            (Booking.requester_id == current_user.user_id)
            | (Booking.provider_id == current_user.user_id)
        )
        .order_by(Booking.created_at.desc())
        .all()
    )
    return bookings


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    req: BookingCreateRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Book a skill swap session with another registered user and place credits in escrow.
    """
    if req.provider_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book a session with yourself.",
        )

    provider = db.query(User).filter(User.user_id == req.provider_id).first()
    if not provider or provider.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected provider was not found or is inactive.",
        )

    requester = db.query(User).filter(User.user_id == current_user.user_id).first()
    if not requester:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if (requester.time_credits or 0.0) < req.credits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient Time Credits to book this session.",
        )

    requester.time_credits = round((requester.time_credits or 0.0) - req.credits, 2)
    requester.in_escrow = round((requester.in_escrow or 0.0) + req.credits, 2)

    booking = Booking(
        requester_id=requester.user_id,
        provider_id=provider.user_id,
        skill_id=req.skill_id,
        skill_title=req.skill_title.strip(),
        scheduled_date=req.scheduled_date.strip(),
        scheduled_time=req.scheduled_time.strip(),
        format=req.format.strip(),
        credits=req.credits,
        status=BookingStatus.IN_ESCROW,
        notes=req.notes or f"{req.format} session on {req.scheduled_date} at {req.scheduled_time}.",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return _load_booking(db, booking.booking_id)


@router.post("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(
    booking_id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Confirm session completion and release escrow credits to the skill provider.
    """
    booking = _load_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.requester_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the session requester can release escrow credits.",
        )

    if booking.status != BookingStatus.IN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is already {booking.status.value}.",
        )

    requester = db.query(User).filter(User.user_id == booking.requester_id).first()
    provider = db.query(User).filter(User.user_id == booking.provider_id).first()

    if not requester or not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking participants not found.")

    requester.in_escrow = max(0.0, round((requester.in_escrow or 0.0) - booking.credits, 2))
    requester.lifetime_spent = round((requester.lifetime_spent or 0.0) + booking.credits, 2)

    provider.time_credits = round((provider.time_credits or 0.0) + booking.credits, 2)
    provider.lifetime_earned = round((provider.lifetime_earned or 0.0) + booking.credits, 2)

    booking.status = BookingStatus.COMPLETED
    booking.completed_at = datetime.now(timezone.utc)
    booking.notes = f"Session completed. {booking.credits} credit(s) transferred to {provider.name}."

    db.commit()
    return _load_booking(db, booking_id)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Cancel an in-escrow booking and refund credits to the requester.
    """
    booking = _load_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.requester_id != current_user.user_id and booking.provider_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this booking.",
        )

    if booking.status != BookingStatus.IN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel booking with status '{booking.status.value}'.",
        )

    requester = db.query(User).filter(User.user_id == booking.requester_id).first()
    if requester:
        requester.in_escrow = max(0.0, round((requester.in_escrow or 0.0) - booking.credits, 2))
        requester.time_credits = round((requester.time_credits or 0.0) + booking.credits, 2)

    booking.status = BookingStatus.CANCELLED
    booking.notes = f"Cancelled by {current_user.name}. {booking.credits} credit(s) refunded."

    db.commit()
    return _load_booking(db, booking_id)
