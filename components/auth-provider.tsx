"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { SecureStorage } from "@/lib/secure-storage"

// Simplified user type
interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  lastLoginAt: number
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  emergencyAccess: () => void
  isOnline: boolean
  pendingChanges: number
  isInitialized: boolean
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  emergencyAccess: () => {},
  isOnline: true,
  pendingChanges: 0,
  isInitialized: false,
})

// Default user for emergency access
const defaultUser: User = {
  id: "default-user",
  name: "Default User",
  email: "user@example.com",
  role: "user",
  lastLoginAt: Date.now(),
}

// List of admin emails
const ADMIN_EMAILS = [
  "charlesmuiruri024@gmail.com",
  // Add any other admin emails here
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [pendingChanges, setPendingChanges] = useState<number>(0)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Try to load user from secure storage on mount
  useEffect(() => {
    try {
      console.log("AuthProvider: Initializing")

      // Check if storage is available
      if (!SecureStorage.isAvailable()) {
        console.log("AuthProvider: Storage not available")
        setIsInitialized(true)
        return
      }

      const storedUser = SecureStorage.getItem("user", null)
      if (storedUser) {
        console.log("AuthProvider: Found stored user")
        setUser(storedUser)
      } else {
        console.log("AuthProvider: No stored user found")
      }

      // Initialize online/offline detection
      if (typeof navigator !== "undefined") {
        setIsOnline(navigator.onLine)
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("AuthProvider: Error initializing", error)
      setIsInitialized(true)
    }
  }, [])

  // Set up event listeners for online/offline events
  useEffect(() => {
    if (!isInitialized) return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [isInitialized])

  // Set up interval to check pending changes
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      try {
        // In a real app, this would check the sync queue
        const pendingItems = SecureStorage.getItem("pendingChanges", [])
        setPendingChanges(Array.isArray(pendingItems) ? pendingItems.length : 0)
      } catch (error) {
        console.error("Error checking pending changes:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isInitialized])

  // Function to check if an email is an admin email
  const isAdminEmail = (email: string): boolean => {
    // Check if the email is in the admin emails list
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return true
    }

    // Also check if the email contains "admin" for backward compatibility
    return email.toLowerCase().includes("admin")
  }

  // Login function with offline support
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Login attempt", { email })

    try {
      // Check if we're online
      if (typeof navigator !== "undefined" && navigator.onLine) {
        // Online login - would normally call your API
        // For demo, we'll simulate a successful login

        // Check if this is an admin email
        const isAdmin = isAdminEmail(email)
        console.log("Is admin email:", isAdmin)

        // Create a user object with explicit isAdmin flag
        const user: User = {
          id: "user-" + Date.now(),
          name: email.split("@")[0],
          email,
          role: isAdmin ? "admin" : "user",
          lastLoginAt: Date.now(),
          isAdmin: isAdmin, // Explicitly set isAdmin flag
        }

        console.log("User created with isAdmin:", isAdmin)

        // Store user securely
        setUser(user)
        SecureStorage.setItem("user", user)

        // Also store credentials securely for offline login
        SecureStorage.setItem("credentials", { email, passwordHash: hashPassword(password) })

        console.log("AuthProvider: Online login successful")
        return true
      } else {
        // Offline login - check stored credentials
        const storedCreds = SecureStorage.getItem("credentials", null)

        if (storedCreds && storedCreds.email === email && storedCreds.passwordHash === hashPassword(password)) {
          // Get stored user
          const storedUser = SecureStorage.getItem("user", null)
          if (storedUser) {
            setUser(storedUser)
            console.log("AuthProvider: Offline login successful")
            return true
          }
        }

        console.log("AuthProvider: Offline login failed - invalid credentials")
        return false
      }
    } catch (error) {
      console.error("AuthProvider: Login error", error)
      return false
    }
  }

  // Simple signup function
  const signup = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    console.log("AuthProvider: Signup attempt", { name, email })

    // Check if we're online - signup requires internet
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.log("AuthProvider: Signup failed - offline")
      return false
    }

    try {
      // Check if this is an admin email
      const isAdmin = isAdminEmail(email)

      // Create a user object
      const user: User = {
        id: "user-" + Date.now(),
        name,
        email,
        role: isAdmin ? "admin" : "user",
        lastLoginAt: Date.now(),
        isAdmin: isAdmin,
      }

      // Store user securely
      setUser(user)
      SecureStorage.setItem("user", user)

      // Store credentials for offline login
      SecureStorage.setItem("credentials", { email, passwordHash: hashPassword(password) })

      console.log("AuthProvider: Signup successful")
      return true
    } catch (error) {
      console.error("AuthProvider: Signup error", error)
      return false
    }
  }

  // Logout function
  const logout = () => {
    console.log("AuthProvider: Logout")
    setUser(null)
    // Note: We don't remove credentials to allow future offline login
    SecureStorage.removeItem("user")
  }

  // Emergency access function
  const emergencyAccess = () => {
    console.log("AuthProvider: Emergency access")
    setUser(defaultUser)
    SecureStorage.setItem("user", defaultUser)
  }

  // If not initialized yet, show a simple loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing Maziwa Smart...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        emergencyAccess,
        isOnline,
        pendingChanges,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Simple password hashing function - in production use a proper hashing library
function hashPassword(password: string): string {
  // This is NOT secure - just for demo purposes
  // In production, use bcrypt or similar
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

export function useAuth() {
  return useContext(AuthContext)
}
