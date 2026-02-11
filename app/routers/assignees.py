from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assignee import Assignee
from app.models.project import ProjectOwner
from app.models.task import Task
from app.models.task_log import TaskLog
from app.models.user import User

router = APIRouter(tags=["Assignees"])

@router.post("/tasks/{task_id}/assignees/{user_id}")
def assign_user(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(Task.taskId == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    is_owner = db.query(ProjectOwner).filter(
        ProjectOwner.projectId == task.projectId,
        ProjectOwner.userId == user.userId,
    ).first()

    if user.role != "admin" and not is_owner:
        raise HTTPException(403, "Not authorized")

    exists = db.query(Assignee).filter(
        Assignee.taskId == task_id,
        Assignee.userId == user_id,
    ).first()

    if exists:
        raise HTTPException(400, "User already assigned")

    assignee = Assignee(taskId=task_id, userId=user_id)
    db.add(assignee)

    db.add(TaskLog(
        taskId=task_id,
        userId=user.userId,
        log=f"User {user_id} assigned to task",
    ))

    db.commit()
    return {"message": "User assigned"}


@router.delete("/tasks/{task_id}/assignees/{user_id}")
def unassign_user(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignee = db.query(Assignee).filter(
        Assignee.taskId == task_id,
        Assignee.userId == user_id,
    ).first()

    if not assignee:
        raise HTTPException(404, "Assignment not found")

    db.delete(assignee)

    db.add(TaskLog(
        taskId=task_id,
        userId=user.userId,
        log=f"User {user_id} unassigned from task",
    ))

    db.commit()
    return {"message": "User unassigned"}

@router.get("/projects/{project_id}/assignees")
def get_project_assignees(
    project_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignees = (
        db.query(User)
        .join(Assignee, Assignee.userId == User.userId)
        .filter(Assignee.taskId == project_id)  # ✅ fixed capitalization
        .all()
    )

    return assignees

@router.get("/users/my/assigned-tasks")
def get_user_assigned_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    tasks = (
        db.query(Task)
        .join(Assignee, Assignee.taskId == Task.taskId)
        .filter(Assignee.userId == user.userId)
        .all()
    )

    return tasks