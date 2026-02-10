"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1]
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async (t: string) => {
    try {
      const payload = decodePayload(t)
      if (!payload || !payload.sub) {
        throw new Error("Invalid token")
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users`,
        {
          headers: { Authorization: `Bearer ${t}` },
        }
      )

      if (!res.ok) {
        // If user can't fetch users list (not admin/manager), use token info
        const sub = payload.sub as string
        setUser({
          userId: parseInt(sub),
          email: "",
          name: "User",
          role: "user",
          joinedAt: "",
        })
        return
      }

      const users: User[] = await res.json()
      const sub = parseInt(payload.sub as string)
      const current = users.find((u) => u.userId === sub)

      if (current) {
        setUser(current)
      }
    } catch {
      localStorage.removeItem("access_token")
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("access_token")
    if (stored) {
      setToken(stored)
      fetchUser(stored).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchUser])

  const login = useCallback(
    (newToken: string) => {
      localStorage.setItem("access_token", newToken)
      setToken(newToken)
      fetchUser(newToken)
    },
    [fetchUser]
  )

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
