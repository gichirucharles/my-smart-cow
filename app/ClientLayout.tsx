"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { BasicSidebar } from "@/components/basic-sidebar"
import { SyncStatus } from "@/components/sync-status"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <BasicSidebar />
      <div className="ml-64 p-6 flex-1">{children}</div>
      <SyncStatus />
    </div>
  )
}
