from enum import Enum

class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class TaskStatus(str, Enum):
    todo = "todo"
    ongoing = "ongoing"
    complete = "complete"

class Billing(str, Enum):
    billable="billable"
    non_billable="non_billable"
