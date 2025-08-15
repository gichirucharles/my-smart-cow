"use client"

import type { ReactNode } from "react"

interface SignupLayoutProps {
  children: ReactNode
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
