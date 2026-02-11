# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.core.dependencies import get_current_user
# from app.core.database import get_db
# from app.schemas.time_entries import TimeEntryCreate, TimeEntryResponse
# from app.models.time_entries import TimeEntry
# from sqlalchemy import func


# router = APIRouter(prefix="/time_entries", tags=["Billing"])

# def validate_daily_hours(db, user_id, work_date, new_hours):
#     total = (
#         db.query(func.coalesce(func.sum(TimeEntry.hours), 0))
#         .filter(TimeEntry.userId == user_id,
#                 TimeEntry.workDate == work_date)
#         .scalar()
#     )
#     if total + new_hours > 8:
#         #raise ValueError("Daily limit exceeded")
#         raise HTTPException(403, "Daily limit exceeded")


# @router.post("/time-entries", response_model=TimeEntryResponse)
# def create_time_entry(
#     payload: TimeEntryCreate,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     validate_daily_hours(
#         db=db,
#         user_id=current_user.userId,
#         work_date=payload.workDate,
#         new_hours=payload.hours,
#     )

#     entry = TimeEntry(
#         userId=current_user.userId,
#         **payload.model_dump()
#     )

#     db.add(entry)
#     db.commit()
#     db.refresh(entry)
#     return entry

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.schemas.time_entries import TimeEntryCreate, TimeEntryResponse
from app.models.time_entries import TimeEntry
from app.models.user import User
from sqlalchemy import func


router = APIRouter(prefix="/time_entries", tags=["Billing"])

def validate_daily_hours(db, user_id, work_date, new_hours, exclude_entry_id=None):
    query = db.query(func.coalesce(func.sum(TimeEntry.hours), 0)).filter(
        TimeEntry.userId == user_id,
        TimeEntry.workDate == work_date
    )
    
    if exclude_entry_id:
        query = query.filter(TimeEntry.id != exclude_entry_id)
    
    total = query.scalar()
    
    if total + new_hours > 8:
        raise HTTPException(403, "Daily limit exceeded. Maximum 8 hours per day.")


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


# IMPORTANT: More specific routes must come BEFORE generic routes
@router.get("/time-entries/stats/summary")
def get_time_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """Get summary statistics for the current user's time entries."""
    query = db.query(
        func.sum(TimeEntry.hours).label("total_hours"),
        func.sum(
            func.case((TimeEntry.billable == "billable", TimeEntry.hours), else_=0)
        ).label("billable_hours"),
        func.count(TimeEntry.id).label("entry_count"),
    ).filter(TimeEntry.userId == current_user.userId)
    
    if start_date:
        query = query.filter(TimeEntry.workDate >= start_date)
    
    if end_date:
        query = query.filter(TimeEntry.workDate <= end_date)
    
    result = query.first()
    
    return {
        "total_hours": float(result.total_hours or 0),
        "billable_hours": float(result.billable_hours or 0),
        "non_billable_hours": float((result.total_hours or 0) - (result.billable_hours or 0)),
        "entry_count": result.entry_count or 0,
    }


@router.get("/time-entries/user/{user_id}", response_model=List[TimeEntryResponse])
def get_user_time_entries(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """
    Get time entries for a specific user.
    Only admins and managers can view other users' time entries.
    """
    # Authorization check
    if current_user.role not in ["admin", "manager"] and current_user.userId != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this user's time entries"
        )
    
    query = db.query(TimeEntry).filter(TimeEntry.userId == user_id)
    
    if project_id:
        query = query.filter(TimeEntry.projectId == project_id)
    
    if start_date:
        query = query.filter(TimeEntry.workDate >= start_date)
    
    if end_date:
        query = query.filter(TimeEntry.workDate <= end_date)
    
    entries = query.order_by(TimeEntry.workDate.desc()).all()
    return entries


@router.get("/time-entries/project/{project_id}", response_model=List[TimeEntryResponse])
def get_project_time_entries(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """
    Get all time entries for a specific project.
    Only admins, managers, and project owners can view.
    """
    # Check authorization
    if current_user.role not in ["admin", "manager"]:
        # Check if user is project owner
        from app.models.projects import ProjectOwner
        is_owner = (
            db.query(ProjectOwner)
            .filter(
                ProjectOwner.projectId == project_id,
                ProjectOwner.userId == current_user.userId
            )
            .first()
        )
        if not is_owner:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view this project's time entries"
            )
    
    query = db.query(TimeEntry).filter(TimeEntry.projectId == project_id)
    
    if start_date:
        query = query.filter(TimeEntry.workDate >= start_date)
    
    if end_date:
        query = query.filter(TimeEntry.workDate <= end_date)
    
    entries = query.order_by(TimeEntry.workDate.desc()).all()
    return entries


@router.get("/time-entries", response_model=List[TimeEntryResponse])
def get_time_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """
    Get time entries for the current user.
    Optionally filter by project_id, start_date, and end_date.
    """
    query = db.query(TimeEntry).filter(TimeEntry.userId == current_user.userId)
    
    if project_id:
        query = query.filter(TimeEntry.projectId == project_id)
    
    if start_date:
        query = query.filter(TimeEntry.workDate >= start_date)
    
    if end_date:
        query = query.filter(TimeEntry.workDate <= end_date)
    
    entries = query.order_by(TimeEntry.workDate.desc()).all()
    return entries


@router.get("/time-entries/{entry_id}", response_model=TimeEntryResponse)
def get_time_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get a specific time entry by ID."""
    entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Users can only view their own entries unless admin/manager
    if current_user.role not in ["admin", "manager"] and entry.userId != current_user.userId:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this time entry"
        )
    
    return entry


@router.patch("/time-entries/{entry_id}", response_model=TimeEntryResponse)
def update_time_entry(
    entry_id: int,
    payload: TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update a time entry. Users can only update their own entries."""
    entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Users can only update their own entries
    if entry.userId != current_user.userId:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this time entry"
        )
    
    # Validate daily hours excluding the current entry
    validate_daily_hours(
        db=db,
        user_id=current_user.userId,
        work_date=payload.workDate,
        new_hours=payload.hours,
        exclude_entry_id=entry_id
    )
    
    # Update entry
    for key, value in payload.model_dump().items():
        setattr(entry, key, value)
    
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/time-entries/{entry_id}")
def delete_time_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a time entry. Users can only delete their own entries."""
    entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Users can only delete their own entries
    if entry.userId != current_user.userId:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this time entry"
        )
    
    db.delete(entry)
    db.commit()
    return {"message": "Time entry deleted successfully"}

