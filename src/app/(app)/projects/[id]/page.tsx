"use client"

import { useState } from "react"
import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { updateTaskStatus } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { KanbanColumn } from "@/components/kanban-column"
import { CreateTaskForm } from "@/components/create-task-form"
import { TaskDetailPanel } from "@/components/task-detail-panel"

interface Task {
  taskId: number
  title: string
  status: string
  priority: string | null
  description?: string
  createdBy?: number
  createdAt?: string
  dueAt?: string
}

interface Project {
  projectId: number
  name: string
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const projectId = parseInt(id)
  const { user } = useAuth()

  const { data: projects } = useSWR<Project[]>("/projects")
  const {
    data: tasks,
    mutate: mutateTasks,
  } = useSWR<Task[]>(`/projects/${projectId}/tasks`)

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const project = projects?.find((p) => p.projectId === projectId)
  const canCreateTask = user?.role === "admin" || user?.role === "manager"

  async function handleStatusChange(taskId: number, newStatus: string) {
    try {
      await updateTaskStatus(taskId, newStatus)
      mutateTasks()
    } catch {
      // Silently handle
    }
  }

  function handleTaskClick(taskId: number) {
    const task = tasks?.find((t) => t.taskId === taskId)
    if (task) setSelectedTask(task)
  }

  const columns = [
    { title: "To Do", status: "todo", accent: "bg-muted-foreground" },
    { title: "In Progress", status: "ongoing", accent: "bg-amber-500" },
    { title: "Complete", status: "complete", accent: "bg-emerald-500" },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to projects</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">
              {project?.name ?? `Project #${projectId}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {tasks ? `${tasks.length} tasks` : "Loading..."}
            </p>
          </div>
        </div>

        {canCreateTask && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>
                  Add a new task to this project
                </DialogDescription>
              </DialogHeader>
              <CreateTaskForm
                projectId={projectId}
                onCreated={() => {
                  setCreateOpen(false)
                  mutateTasks()
                }}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Board */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={tasks ?? []}
              accent={col.accent}
              onStatusChange={handleStatusChange}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        {selectedTask && (
          <div className="w-80 shrink-0">
            <TaskDetailPanel
              task={selectedTask}
              onStatusUpdated={() => {
                mutateTasks()
                const updated = tasks?.find(
                  (t) => t.taskId === selectedTask.taskId
                )
                if (updated) setSelectedTask(updated)
              }}
              onClose={() => setSelectedTask(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
