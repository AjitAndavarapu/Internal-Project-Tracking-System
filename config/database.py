from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase

DATABASE_URL = "sqlite:///./tracker.db"

engine = create_engine(
    DATABASE_URL,echo=True
)

SessionLocal = sessionmaker(bind=engine,autoflush=False,autocommit=False)


class Base(DeclarativeBase):
    pass


from models.user import User  
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    

