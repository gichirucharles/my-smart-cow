"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoadingSpinner } from "@/components/loading-spinner"

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/pricing", "/terms", "/forgot-password", "/reset-password"]

// Admin routes
const ADMIN_ROUTES = ["/admin", "/settings/admin"]

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading spinner during initial load
  if (!isClient || loading) {
    return <LoadingSpinner />
  }

  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  // Check for admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user || !userProfile || userProfile.role !== "admin") {
      router.push("/login")
      return <LoadingSpinner />
    }
    return <>{children}</>
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      router.push("/login")
      return <LoadingSpinner />
    }
    return <>{children}</>
  }

  // Default: allow access
  return <>{children}</>
}
