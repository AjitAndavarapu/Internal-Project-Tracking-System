# schemas/time_entry.py

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from backend.core.enums import Billing

# ---------- CREATE ----------

class TimeEntryCreate(BaseModel):
    projectId: int
    taskId: Optional[int] = None
    hours: Decimal = Field(gt=0)
    billable: Billing
    workDate: date
    note: Optional[str] = None


# ---------- RESPONSE ----------

class TimeEntryResponse(BaseModel):
    timeEntryId: int
    userId: int
    projectId: int
    taskId: Optional[int]
    hours: Decimal
    billable: Billing
    workDate: date
    note: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True
