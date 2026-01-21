from fastapi import FastAPI
from routers import auth
from config.database import engine
from config.database import Base

app = FastAPI(title="Project Tracking System")
Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
