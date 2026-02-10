from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.schemas.time_entries import TimeEntryCreate, TimeEntryResponse
from app.models.time_entries import TimeEntry
from sqlalchemy import func


router = APIRouter(prefix="/time_entries", tags=["Billing"])

def validate_daily_hours(db, user_id, work_date, new_hours):
    total = (
        db.query(func.coalesce(func.sum(TimeEntry.hours), 0))
        .filter(TimeEntry.userId == user_id,
                TimeEntry.workDate == work_date)
        .scalar()
    )
    if total + new_hours > 8:
        #raise ValueError("Daily limit exceeded")
        raise HTTPException(403, "Daily limit exceeded")


@router.post("/time-entries", response_model=TimeEntryResponse)
def create_time_entry(
    payload: TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    validate_daily_hours(
        db=db,
        user_id=current_user.userId,
        work_date=payload.workDate,
        new_hours=payload.hours,
    )

    entry = TimeEntry(
        userId=current_user.userId,
        **payload.model_dump()
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
