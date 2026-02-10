from fastapi import HTTPException
from backend.core.enums import Role

def require_role(user, roles: list[Role]):
    if user.role not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
