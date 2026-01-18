from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True)
    taskId = Column(Integer, ForeignKey("tasks.taskId"))
    userId = Column(Integer, ForeignKey("users.userId"))
    log = Column(String, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
