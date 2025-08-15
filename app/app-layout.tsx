"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/terms", "/pricing"]

// Admin routes that require admin privileges
const adminRoutes = ["/admin", "/admin/login", "/admin/setup", "/admin/settings", "/settings/admin"]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, supabaseConfigured } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  useEffect(() => {
    if (loading) return

    // If Supabase is not configured and not on login page, redirect to login
    if (!supabaseConfigured && !isPublicRoute) {
      console.log("🔄 Supabase not configured, redirecting to login")
      router.push("/login")
      return
    }

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      console.log("🔄 User not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    // If user is authenticated and on login/signup page, redirect to dashboard
    if (user && (pathname === "/login" || pathname === "/signup")) {
      console.log("🔄 User authenticated, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    // Check admin access for admin routes
    if (isAdminRoute && user && !user.is_admin) {
      console.log("🔄 Non-admin user trying to access admin route, redirecting to dashboard")
      router.push("/dashboard")
      return
    }
  }, [user, loading, supabaseConfigured, pathname, router, isPublicRoute, isAdminRoute])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Render public routes without sidebar
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Render authenticated routes with sidebar
  if (user && supabaseConfigured) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {pathname !== "/dashboard" && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {pathname
                          .split("/")
                          .pop()
                          ?.replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Fallback - should not reach here normally
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
