const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.detail || "Request failed", res.status)
  }

  return res.json()
}

// --- Auth ---
export async function loginUser(email: string, password: string) {
  const body = new URLSearchParams()
  body.append("username", email)
  body.append("password", password)

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.detail || "Login failed", res.status)
  }

  return res.json()
}

export async function registerUser(data: {
  email: string
  name: string
  password: string
  role: string
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// --- Projects ---
export async function getProjects() {
  return request<{ projectId: number; name: string }[]>("/projects")
}

export async function createProject(name: string) {
  return request<{ projectId: number; name: string }>("/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

// --- Tasks ---
export async function getProjectTasks(projectId: number) {
  return request<
    {
      taskId: number
      title: string
      status: string
      priority: string | null
      description?: string
      createdBy?: number
      createdAt?: string
      dueAt?: string
    }[]
  >(`/projects/${projectId}/tasks`)
}

export async function createTask(
  projectId: number,
  data: {
    title: string
    description?: string
    priority?: string
    dueAt?: string
    assets?: string[]
  }
) {
  return request(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateTaskStatus(taskId: number, status: string) {
  return request(`/tasks/${taskId}/status?status=${status}`, {
    method: "PATCH",
  })
}

// --- Assignees ---
export async function assignUser(taskId: number, userId: number) {
  return request(`/tasks/${taskId}/assignees/${userId}`, {
    method: "POST",
  })
}

export async function unassignUser(taskId: number, userId: number) {
  return request(`/tasks/${taskId}/assignees/${userId}`, {
    method: "DELETE",
  })
}

// --- Task Logs ---
export async function getTaskLogs(taskId: number) {
  return request<
    { id: number; taskId: number; userId: number; log: string; createdAt: string }[]
  >(`/tasks/${taskId}/logs`)
}

// --- Users ---
export async function getUsers() {
  return request<
    {
      userId: number
      email: string
      name: string
      role: string
      joinedAt: string
    }[]
  >("/users")
}

// --- Time Entries ---
export async function createTimeEntry(data: {
  projectId: number
  taskId?: number
  hours: number
  billable: string
  workDate: string
  note?: string
}) {
  return request("/time_entries/time-entries", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
