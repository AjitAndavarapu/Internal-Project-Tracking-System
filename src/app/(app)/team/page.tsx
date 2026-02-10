"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { Users, Shield, UserCog, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface UserData {
  userId: number
  email: string
  name: string
  role: string
  joinedAt: string
}

const roleConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  admin: { icon: Shield, color: "bg-destructive/15 text-destructive border-destructive/30" },
  manager: { icon: UserCog, color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  user: { icon: UserIcon, color: "bg-primary/15 text-primary border-primary/30" },
}

export default function TeamPage() {
  const { data: users, error } = useSWR<UserData[]>("/users")

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">
          View and manage your team
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          You need admin or manager permissions to view team members.
        </div>
      )}

      {!users && !error ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading team...
        </div>
      ) : users ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Members</CardDescription>
                <CardTitle className="text-3xl">{users.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Admins</CardDescription>
                <CardTitle className="text-3xl">
                  {users.filter((u) => u.role === "admin").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Managers</CardDescription>
                <CardTitle className="text-3xl">
                  {users.filter((u) => u.role === "manager").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                All Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {users.map((user) => {
                  const config = roleConfig[user.role] ?? roleConfig.user
                  const RoleIcon = config.icon
                  return (
                    <div
                      key={user.userId}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`gap-1 capitalize ${config.color}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {user.role}
                      </Badge>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        Joined {format(new Date(user.joinedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
