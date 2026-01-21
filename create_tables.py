from app.core.database import engine, Base
from app.models import user, project, task, assignee, task_log, time_entries

Base.metadata.create_all(bind=engine)
