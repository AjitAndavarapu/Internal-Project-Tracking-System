"use client"

import { useState } from "react"
import useSWR from "swr"
import { Clock, Plus } from "lucide-react"
import { createTimeEntry } from "@/lib/api"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Project {
  projectId: number
  name: string
}

export default function TimeEntriesPage() {
  const { data: projects } = useSWR<Project[]>("/projects")

  const [open, setOpen] = useState(false)
  const [projectId, setProjectId] = useState("")
  const [hours, setHours] = useState("")
  const [billable, setBillable] = useState("non_billable")
  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setCreating(true)

    try {
      await createTimeEntry({
        projectId: parseInt(projectId),
        hours: parseFloat(hours),
        billable,
        workDate,
        note: note || undefined,
      })
      setSuccess("Time entry logged successfully")
      setProjectId("")
      setHours("")
      setNote("")
      setOpen(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to log time"
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Entries</h1>
          <p className="text-muted-foreground">
            Log and track hours across your projects
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Time
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
              <DialogDescription>
                Record hours worked on a project (max 8 hours/day)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem
                        key={p.projectId}
                        value={p.projectId.toString()}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="8"
                    placeholder="e.g., 2.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Work Date</Label>
                  <Input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Billing Type</Label>
                <Select value={billable} onValueChange={setBillable}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billable">Billable</SelectItem>
                    <SelectItem value="non_billable">Non-Billable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Note</Label>
                <Textarea
                  placeholder="What did you work on?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !projectId}>
                  {creating ? "Logging..." : "Log Time"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>
            Track time spent on projects to manage billing and productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium">Log Hours</h3>
              <p className="text-xs text-muted-foreground">
                Record time spent on each project, up to 8 hours per day
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-600">
                {"$"}
              </div>
              <h3 className="text-sm font-medium">Mark Billable</h3>
              <p className="text-xs text-muted-foreground">
                Categorize entries as billable or non-billable
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {"#"}
              </div>
              <h3 className="text-sm font-medium">Add Notes</h3>
              <p className="text-xs text-muted-foreground">
                Attach notes to describe what you worked on
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
