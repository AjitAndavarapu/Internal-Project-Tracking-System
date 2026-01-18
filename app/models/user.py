from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.enums import Role

class User(Base):
    __tablename__ = "users"

    userId = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    # role = Column(String, nullable=False)  # admin, manager, user
    role = Column(String, default=Role.user)
    password_hash = Column(String, nullable=False)
    joinedAt = Column(DateTime(timezone=True), server_default=func.now())
