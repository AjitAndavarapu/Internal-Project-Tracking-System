"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetcher(url: string) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${url}`, { headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.detail || "Fetch failed")
    throw error
  }

  return res.json()
}

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  )
}
