from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.utils.perimissions import require_role
from app.models.user import User
from app.schemas.user import UserOut
from app.core.enums import Role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_role(current_user, [Role.admin, Role.manager])

    users = db.query(User).all()
    return users
