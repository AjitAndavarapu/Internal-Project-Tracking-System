from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.project import Project, ProjectOwner
from app.schemas.project import ProjectCreate, ProjectOut
from app.utils.perimissions import require_role
from app.models.task import Task
from app.models.assignee import Assignee


router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectOut)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    require_role(user, ["admin", "manager"])

    project = Project(name=data.name)
    db.add(project)
    db.commit()
    db.refresh(project)

    owner = ProjectOwner(projectId=project.projectId, userId=user.userId)
    db.add(owner)
    db.commit()

    return project

# @router.get("", response_model=list[ProjectOut])
# def get_projects(
#     db: Session = Depends(get_db),
#     user=Depends(get_current_user),
# ):
#     if user.role == "admin":
#         return db.query(Project).all()

#     return (
#         db.query(Project)
#         .join(ProjectOwner)
#         .filter(ProjectOwner.userId == user.userId)
#         .all()
#     )

@router.get("", response_model=list[ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == "admin":
        return db.query(Project).all()

    # Get projects where user is owner
    owned_projects = (
        db.query(Project)
        .join(ProjectOwner)
        .filter(ProjectOwner.userId == user.userId)
    )
    
    # Get projects where user has assigned tasks
    assigned_projects = (
        db.query(Project)
        .join(Task, Task.projectId == Project.projectId)
        .join(Assignee, Assignee.taskId == Task.taskId)
        .filter(Assignee.userId == user.userId)
    )
    
    # Union both queries and remove duplicates
    all_projects = owned_projects.union(assigned_projects).all()
    
    return all_projects

@router.get("/accessible", response_model=list[ProjectOut])
def get_accessible_projects(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == "admin":
        return db.query(Project).all()

    # Projects where user is owner or has assigned tasks
    return (
        db.query(Project)
        .outerjoin(ProjectOwner, ProjectOwner.projectId == Project.projectId)
        .outerjoin(Task, Task.projectId == Project.projectId)
        .outerjoin(Assignee, Assignee.taskId == Task.taskId)
        .filter(
            (ProjectOwner.userId == user.userId) | 
            (Assignee.userId == user.userId)
        )
        .distinct()
        .all()
    )