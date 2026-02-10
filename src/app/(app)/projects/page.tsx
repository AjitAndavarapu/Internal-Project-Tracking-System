"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { FolderKanban, Plus } from "lucide-react"
import { createProject } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Project {
  projectId: number
  name: string
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { data: projects, mutate } = useSWR<Project[]>("/projects")
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const canCreate = user?.role === "admin" || user?.role === "manager"

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setCreating(true)
    try {
      await createProject(name)
      setName("")
      setOpen(false)
      mutate()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create project"
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and view all your projects
          </p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Add a new project to your workspace
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="e.g., Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!projects ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              {canCreate
                ? 'Create your first project to get started'
                : "No projects have been assigned to you yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.projectId} href={`/projects/${project.projectId}`}>
              <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CardTitle className="truncate text-base">
                      {project.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2 text-xs">
                      ID: {project.projectId}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
