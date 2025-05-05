// Export a function to get the current theme
export function getCurrentTheme() {
  // This is a client-side only function
  if (typeof window === "undefined") return "light"

  const savedTheme = localStorage.getItem("maziwa-smart-theme")
  if (savedTheme) return savedTheme

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }

  return "light"
}

// Export a function to set the theme
export function setTheme(theme: "light" | "dark" | "system") {
  if (typeof window === "undefined") return

  localStorage.setItem("maziwa-smart-theme", theme)

  const root = window.document.documentElement
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}
