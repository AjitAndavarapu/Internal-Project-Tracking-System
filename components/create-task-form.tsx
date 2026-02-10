"use client"

import { useState } from "react"
import { createTask } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DialogFooter,
} from "@/components/ui/dialog"

interface CreateTaskFormProps {
  projectId: number
  onCreated: () => void
  onCancel: () => void
}

export function CreateTaskForm({
  projectId,
  onCreated,
  onCancel,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setCreating(true)

    try {
      await createTask(projectId, {
        title,
        description: description || undefined,
        priority: priority || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      })
      onCreated()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create task"
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          placeholder="e.g., Design landing page"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="task-desc">Description</Label>
        <Textarea
          id="task-desc"
          placeholder="Optional details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="task-due">Due Date</Label>
          <Input
            id="task-due"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  )
}
