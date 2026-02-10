"use client"

import { cn } from "@/lib/utils"
import { TaskCard } from "@/components/task-card"

interface KanbanColumnProps {
  title: string
  status: string
  tasks: {
    taskId: number
    title: string
    status: string
    priority: string | null
    description?: string
    dueAt?: string
  }[]
  accent: string
  onStatusChange: (taskId: number, newStatus: string) => void
  onTaskClick: (taskId: number) => void
}

export function KanbanColumn({
  title,
  status,
  tasks,
  accent,
  onStatusChange,
  onTaskClick,
}: KanbanColumnProps) {
  const filtered = tasks.filter((t) => t.status === status)

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-lg border bg-card/50 lg:w-auto lg:shrink">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className={cn("h-2 w-2 rounded-full", accent)} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {filtered.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No tasks
          </p>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onStatusChange={onStatusChange}
              onClick={() => onTaskClick(task.taskId)}
            />
          ))
        )}
      </div>
    </div>
  )
}
