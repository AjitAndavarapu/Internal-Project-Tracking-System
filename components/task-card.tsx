"use client"

import { GripVertical, ArrowRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: {
    taskId: number
    title: string
    status: string
    priority: string | null
    description?: string
    dueAt?: string
  }
  onStatusChange?: (taskId: number, newStatus: string) => void
  onClick?: () => void
}

const statusFlow: Record<string, string | null> = {
  todo: "ongoing",
  ongoing: "complete",
  complete: null,
}

const priorityColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
}

export function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
  const nextStatus = statusFlow[task.status]

  return (
    <Card
      className="group cursor-pointer border-border/60 p-3 transition-all hover:border-primary/40 hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {task.priority && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] capitalize",
                  priorityColors[task.priority] ?? ""
                )}
              >
                {task.priority}
              </Badge>
            )}
            {task.dueAt && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(task.dueAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {nextStatus && onStatusChange && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(task.taskId, nextStatus)
            }}
          >
            <ArrowRight className="mr-1 h-3 w-3" />
            {nextStatus === "ongoing" ? "Start" : "Done"}
          </Button>
        )}
      </div>
    </Card>
  )
}
