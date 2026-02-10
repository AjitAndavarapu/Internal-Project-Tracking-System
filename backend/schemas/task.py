from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from backend.core.enums import TaskStatus


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None
    dueAt: Optional[datetime] = None
    assets: Optional[List[str]] = []


class TaskOut(BaseModel):
    taskId: int
    title: str
    status: str
    priority: Optional[str]

    class Config:
        from_attributes = True


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
