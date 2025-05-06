"use client"

import type React from "react"

// This file provides fallback functionality for components that might be trying to use next-themes

// Re-export our local ThemeProvider's useTheme hook
export { useTheme } from "@/components/theme-provider"

// Add any other exports that might be needed
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is just a pass-through component that will be replaced by our actual ThemeProvider
  return <>{children}</>
}

// Additional fallbacks for other next-themes exports if needed
export const useThemeMode = () => {
  const { theme, setTheme } = useTheme()
  return { theme, setTheme }
}
