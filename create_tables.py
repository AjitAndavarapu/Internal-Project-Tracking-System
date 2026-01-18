from app.core.database import engine, Base
from app.models import user, project, task, assignee, task_log

Base.metadata.create_all(bind=engine)
