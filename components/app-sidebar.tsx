"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  Users,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/time-entries", label: "Time Entries", icon: Clock },
  { href: "/team", label: "Team", icon: Users, roles: ["admin", "manager"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <FolderKanban className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Tracker</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems
            .filter((item) => {
              if (!item.roles) return true
              return user && item.roles.includes(user.role)
            })
            .map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
        </ul>
      </nav>

      {user && (
        <div className="border-t px-3 py-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <Badge variant="outline" className="mt-0.5 text-[10px] capitalize">
                {user.role}
              </Badge>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
