"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function ThemeProviderComponent({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  // Initialize with defaultTheme, then update from localStorage in useEffect
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // Load theme from localStorage on client-side only
  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme | null) : null

    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  // Apply theme class to document
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Add these exports to make it compatible with next-themes
export const ThemeProvider = Object.assign(ThemeProviderComponent, {
  Provider: ThemeProviderComponent,
})

export function useThemeMode() {
  const { theme, setTheme } = useTheme()
  return { theme, setTheme }
}
