"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FolderKanban } from "lucide-react"
import { loginUser } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await loginUser(email, password)
      login(data.access_token)
      router.push("/dashboard")
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <FolderKanban className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Sign in to Tracker</CardTitle>
          <CardDescription>
            Enter your credentials to access your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
