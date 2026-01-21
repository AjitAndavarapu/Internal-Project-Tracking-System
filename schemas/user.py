from pydantic import BaseModel,EmailStr
from schemas.enums import Role
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Role


    
class Token(BaseModel):
    access_token: str    
    token_type: str = "bearer"
    
class UserOut(BaseModel):
    userId: int
    email: str
    name: str
    role: Role
    joinedAt: datetime

    class Config:
        from_attributes = True