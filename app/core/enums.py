from enum import Enum

class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class TaskStatus(str, Enum):
    todo = "todo"
    ongoing = "ongoing"
    complete = "complete"
