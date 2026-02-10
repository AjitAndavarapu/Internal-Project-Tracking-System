"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTaskStatus } from "@/lib/api"
import { cn } from "@/lib/utils"

interface TaskDetailPanelProps {
  task: {
    taskId: number
    title: string
    status: string
    priority: string | null
    description?: string
    dueAt?: string
    createdAt?: string
  }
  onStatusUpdated: () => void
  onClose: () => void
}

interface LogEntry {
  id: number
  taskId: number
  userId: number
  log: string
  createdAt: string
}

const statusColorMap: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  ongoing: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  complete: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
}

export function TaskDetailPanel({
  task,
  onStatusUpdated,
  onClose,
}: TaskDetailPanelProps) {
  const { data: logs } = useSWR<LogEntry[]>(`/tasks/${task.taskId}/logs`)

  async function handleStatusChange(newStatus: string) {
    try {
      await updateTaskStatus(task.taskId, newStatus)
      onStatusUpdated()
    } catch {
      // Silent fail, logs will show the error
    }
  }

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Task Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-semibold">{task.title}</h3>

        {task.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select
              value={task.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Priority</span>
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                task.priority === "high" && "border-destructive/30 text-destructive",
                task.priority === "medium" && "border-amber-500/30 text-amber-600",
                task.priority === "low" && "border-emerald-500/30 text-emerald-600"
              )}
            >
              {task.priority || "None"}
            </Badge>
          </div>

          {task.dueAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className="text-sm">
                {format(new Date(task.dueAt), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {task.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">
                {format(new Date(task.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h4 className="mb-3 text-sm font-semibold">Activity Log</h4>
          {!logs ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No activity yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-1 rounded-md border px-3 py-2"
                >
                  <p className="text-xs">{log.log}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")} ·
                    User #{log.userId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
