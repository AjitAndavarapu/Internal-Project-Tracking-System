from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.task_log import TaskLog
from app.models.assignee import Assignee
from app.models.task import Task

router = APIRouter(tags=["Task Logs"])

@router.get("/tasks/{task_id}/logs")
def get_task_logs(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(Task.taskId == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    is_assignee = db.query(Assignee).filter(
        Assignee.taskId == task_id,
        Assignee.userId == user.userId,
    ).first()

    if user.role != "admin" and not is_assignee:
        raise HTTPException(403, "Not authorized")

    return db.query(TaskLog).filter(TaskLog.taskId == task_id).all()
