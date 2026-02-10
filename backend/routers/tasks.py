from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.task import Task
from app.models.project import ProjectOwner
from app.models.task_log import TaskLog
from app.schemas.task import TaskCreate, TaskOut

router = APIRouter(tags=["Tasks"])

@router.post("/projects/{project_id}/tasks", response_model=TaskOut)
def create_task(
    project_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    is_owner = (
        db.query(ProjectOwner)
        .filter(
            ProjectOwner.projectId == project_id,
            ProjectOwner.userId == user.userId,
        )
        .first()
    )

    if not is_owner and user.role != "admin":
        raise HTTPException(403, "Not project owner")

    task = Task(
        projectId=project_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        dueAt=data.dueAt,
        assets=data.assets,
        createdBy=user.userId,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    log = TaskLog(
        taskId=task.taskId,
        userId=user.userId,
        log="Task created",
    )
    db.add(log)
    db.commit()

    return task

@router.patch("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(Task.taskId == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    old_status = task.status
    task.status = status

    log = TaskLog(
        taskId=task_id,
        userId=user.userId,
        log=f"Status changed from {old_status} → {status}",
    )

    db.add(log)
    db.commit()

    return {"message": "Status updated"}
