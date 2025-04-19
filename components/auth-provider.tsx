"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Simplified user type
interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => void
  signup: (name: string, email: string, password: string) => void
  logout: () => void
  emergencyAccess: () => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
  emergencyAccess: () => {},
})

// Default user for emergency access
const defaultUser: User = {
  id: "default-user",
  name: "Default User",
  email: "user@example.com",
  role: "user",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Try to load user from localStorage on mount
  useEffect(() => {
    console.log("AuthProvider: Initializing")
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        console.log("AuthProvider: Found stored user")
        setUser(JSON.parse(storedUser))
      } else {
        console.log("AuthProvider: No stored user found")
      }
    } catch (error) {
      console.error("AuthProvider: Error loading user", error)
    }
  }, [])

  // Simple login function
  const login = (email: string, password: string) => {
    console.log("AuthProvider: Login attempt", { email })

    // Create a simple user object
    const user: User = {
      id: "user-" + Date.now(),
      name: email.split("@")[0],
      email,
      role: "user",
    }

    // Store user in state and localStorage
    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
    console.log("AuthProvider: Login successful")
  }

  // Simple signup function
  const signup = (name: string, email: string, password: string) => {
    console.log("AuthProvider: Signup attempt", { name, email })

    // Create a simple user object
    const user: User = {
      id: "user-" + Date.now(),
      name,
      email,
      role: "user",
    }

    // Store user in state and localStorage
    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
    console.log("AuthProvider: Signup successful")
  }

  // Logout function
  const logout = () => {
    console.log("AuthProvider: Logout")
    setUser(null)
    localStorage.removeItem("user")
  }

  // Emergency access function
  const emergencyAccess = () => {
    console.log("AuthProvider: Emergency access")
    setUser(defaultUser)
    localStorage.setItem("user", JSON.stringify(defaultUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, emergencyAccess }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
