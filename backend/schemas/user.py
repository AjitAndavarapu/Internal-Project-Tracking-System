from pydantic import BaseModel
from backend.core.enums import Role
from datetime import datetime

class UserOut(BaseModel):
    userId: int
    email: str
    name: str
    role: Role
    joinedAt: datetime

    class Config:
        from_attributes = True
        
