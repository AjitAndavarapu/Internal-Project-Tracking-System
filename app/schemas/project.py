from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str


class ProjectOut(BaseModel):
    projectId: int
    name: str

    class Config:
        from_attributes = True
