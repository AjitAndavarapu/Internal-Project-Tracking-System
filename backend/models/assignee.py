from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class Assignee(Base):
    __tablename__ = "assignees"

    userId = Column(Integer, ForeignKey("users.userId"), primary_key=True)
    taskId = Column(Integer, ForeignKey("tasks.taskId"), primary_key=True)
