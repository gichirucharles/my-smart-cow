import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "Maziwa Smart - Dairy Farm Management",
  description: "Track and manage your dairy farm operations efficiently",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-512x512.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-512x512.png" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
