"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { isSupabaseConfigured } from "@/lib/supabase"

const publicRoutes = ["/login", "/signup", "/admin/setup", "/settings"]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const isPublicRoute = publicRoutes.includes(pathname)
  const isConfigured = isSupabaseConfigured()

  // Show minimal layout for settings page when not configured
  if (!isConfigured || isPublicRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  // Show full app layout for authenticated users
  return <div className="min-h-screen">{children}</div>
}
