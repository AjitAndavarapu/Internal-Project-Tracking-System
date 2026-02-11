from fastapi import FastAPI
from app.routers import auth, projects, tasks, assignees, task_logs, users, time_entries
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Project Tracking System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["greet"])
def greet():
    return {"Welcome to internal project tracking system"}

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(assignees.router)
app.include_router(task_logs.router)
app.include_router(users.router)
app.include_router(time_entries.router)