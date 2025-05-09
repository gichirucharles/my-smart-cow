import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SimplifiedSidebar } from "@/components/simplified-sidebar"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Maziwa Smart",
  description: "Dairy Farm Management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="flex min-h-screen">
            <div className="hidden md:block fixed h-screen overflow-y-auto">
              <SimplifiedSidebar />
            </div>
            <div className="flex-1 md:ml-64 overflow-y-auto h-screen">{children}</div>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
