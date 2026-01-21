from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    projectId = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class ProjectOwner(Base):
    __tablename__ = "project_owners"

    projectId = Column(Integer, ForeignKey("projects.projectId"), primary_key=True)
    userId = Column(Integer, ForeignKey("users.userId"), primary_key=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
