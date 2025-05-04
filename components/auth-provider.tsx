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
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  emergencyAccess: () => void
  isOnline: boolean
  pendingChanges: number
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
})

// Default user for emergency access
const defaultUser: User = {
  id: "default-user",
  name: "Default User",
  email: "user@example.com",
  role: "user",
  lastLoginAt: Date.now(),
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [pendingChanges, setPendingChanges] = useState<number>(0)

  // Try to load user from secure storage on mount
  useEffect(() => {
    console.log("AuthProvider: Initializing")
    try {
      const storedUser = SecureStorage.getItem("user", null)
      if (storedUser) {
        console.log("AuthProvider: Found stored user")
        setUser(storedUser)
      } else {
        console.log("AuthProvider: No stored user found")
      }
    } catch (error) {
      console.error("AuthProvider: Error loading user", error)
    }

    // Initialize online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline events
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set up interval to check pending changes (simplified for now)
    const interval = setInterval(() => {
      // In a real app, this would check the sync queue
      const pendingItems = SecureStorage.getItem("pendingChanges", [])
      setPendingChanges(pendingItems.length)
    }, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Login function with offline support
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Login attempt", { email })

    try {
      // Check if we're online
      if (navigator.onLine) {
        // Online login - would normally call your API
        // For demo, we'll simulate a successful login

        // Create a user object
        const user: User = {
          id: "user-" + Date.now(),
          name: email.split("@")[0],
          email,
          role: "user",
          lastLoginAt: Date.now(),
        }

        // Store user securely
        setUser(user)
        SecureStorage.setItem("user", user)

        // Also store credentials securely for offline login
        // In a real app, you'd store a token instead of the password
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
    if (!navigator.onLine) {
      console.log("AuthProvider: Signup failed - offline")
      return false
    }

    try {
      // Create a simple user object
      const user: User = {
        id: "user-" + Date.now(),
        name,
        email,
        role: "user",
        lastLoginAt: Date.now(),
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
