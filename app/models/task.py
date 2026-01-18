from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.enums import TaskStatus

class Task(Base):
    __tablename__ = "tasks"

    taskId = Column(Integer, primary_key=True, index=True)
    projectId = Column(Integer, ForeignKey("projects.projectId"))
    title = Column(String, nullable=False)
    description = Column(String)
    # status = Column(String, default="todo")  # todo, ongoing, complete
    status = Column(String, default=TaskStatus.todo)
    priority = Column(String)
    assets = Column(JSON)
    createdBy = Column(Integer, ForeignKey("users.userId"))
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    dueAt = Column(DateTime)
