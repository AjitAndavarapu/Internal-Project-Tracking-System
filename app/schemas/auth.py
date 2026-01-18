from pydantic import BaseModel, EmailStr
from app.core.enums import Role

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    # role: str  # admin / manager / user
    role: Role

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
