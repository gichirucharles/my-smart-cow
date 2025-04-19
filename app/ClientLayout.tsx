"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebarToggle } from "@/components/mobile-sidebar-toggle"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/terms", "/admin/login"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Simple loading effect
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // For public routes, just render the children
  if (isPublicRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // For protected routes, always show the sidebar
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Toggle */}
      <MobileSidebarToggle />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <main className="p-4">{children}</main>
      </div>

      <Toaster />
    </div>
  )
}
