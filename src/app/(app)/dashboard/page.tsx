"use client"

import useSWR from "swr"
import { FolderKanban, CheckCircle2, Clock, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Project {
  projectId: number
  name: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects } = useSWR<Project[]>("/projects")

  const projectCount = projects?.length ?? 0

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          Welcome back, {user?.name ?? "User"}
        </h1>
        <p className="text-muted-foreground">
          {"Here's an overview of your workspace."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projectCount}
          icon={FolderKanban}
          description="Active projects"
        />
        <StatCard
          title="Tasks"
          value="--"
          icon={CheckCircle2}
          description="Across all projects"
        />
        <StatCard
          title="Hours Logged"
          value="--"
          icon={Clock}
          description="This month"
        />
        <StatCard
          title="Your Role"
          value={user?.role ?? "--"}
          icon={Users}
          description="Access level"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Your Projects</h2>
        {!projects ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No projects yet</p>
              {(user?.role === "admin" || user?.role === "manager") && (
                <Link
                  href="/projects"
                  className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Create your first project
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.projectId} href={`/projects/${project.projectId}`}>
                <Card className="cursor-pointer transition-colors hover:border-primary/50">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <FolderKanban className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CardTitle className="truncate text-base">
                        {project.name}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{project.projectId}
                    </Badge>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
