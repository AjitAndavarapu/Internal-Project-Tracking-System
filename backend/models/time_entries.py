from sqlalchemy import (
    Column, Integer, ForeignKey, Date, Numeric,
    Boolean, Text, DateTime, func, String
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.enums import Billing

class TimeEntry(Base):
    __tablename__ = "time_entries"

    timeEntryId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"), nullable=False)
    projectId = Column(Integer, ForeignKey("projects.projectId"), nullable=False)
    taskId = Column(Integer, ForeignKey("tasks.taskId"), nullable=True)

    hours = Column(Numeric(5, 2), nullable=False)  # e.g. 1.50
    billable = Column(String, default=Billing.non_billable)
    workDate = Column(Date, nullable=False)

    note = Column(Text)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())