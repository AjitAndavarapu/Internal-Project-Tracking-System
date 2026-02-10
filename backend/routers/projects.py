from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.project import Project, ProjectOwner
from app.schemas.project import ProjectCreate, ProjectOut
from app.utils.perimissions import require_role

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

@router.get("", response_model=list[ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == "admin":
        return db.query(Project).all()

    return (
        db.query(Project)
        .join(ProjectOwner)
        .filter(ProjectOwner.userId == user.userId)
        .all()
    )
