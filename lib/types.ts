export type Role = "admin" | "manager" | "user"

export type TaskStatus = "todo" | "ongoing" | "complete"

export type Billing = "billable" | "non_billable"

export interface User {
  userId: number
  email: string
  name: string
  role: Role
  joinedAt: string
}

export interface Project {
  projectId: number
  name: string
}

export interface Task {
  taskId: number
  projectId: number
  title: string
  description?: string
  status: TaskStatus
  priority?: string
  assets?: string[]
  createdBy: number
  createdAt: string
  dueAt?: string
}

export interface TaskLog {
  id: number
  taskId: number
  userId: number
  log: string
  createdAt: string
}

export interface TimeEntry {
  timeEntryId: number
  userId: number
  projectId: number
  taskId?: number
  hours: number
  billable: Billing
  workDate: string
  note?: string
  createdAt: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}
