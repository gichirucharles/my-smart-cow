"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, Lock, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminSetupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isAdminSetup, setIsAdminSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is already set up
    try {
      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const adminExists = users.some((user: any) => user.isAdmin)
        setIsAdminSetup(adminExists)

        if (adminExists) {
          // Check if current user is admin
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
          if (!currentUser.isAdmin) {
            router.push("/")
          }
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error checking admin setup:", error)
      setIsLoading(false)
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate inputs
    if (!name || !email || !password) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      if (typeof window === "undefined") return

      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // If admin setup, check if any admin already exists
      if (!isAdminSetup) {
        const adminExists = users.some((user: any) => user.isAdmin)
        if (adminExists) {
          setError("Admin already set up")
          return
        }
      }

      // Check if email already exists
      const emailExists = users.some((user: any) => user.email === email)
      if (emailExists) {
        setError("Email already exists")
        return
      }

      // Create new admin user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, this should be hashed
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }

      // Add to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // If this is initial setup, also set as current user
      if (!isAdminSetup) {
        localStorage.setItem("currentUser", JSON.stringify(newUser))
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isAdminSetup ? "Invite Admin User" : "Admin Setup"}</CardTitle>
          <CardDescription>
            {isAdminSetup
              ? "Create credentials for a new admin user"
              : "Set up your initial admin account to manage Maziwa Smart"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {isAdminSetup
                  ? "Admin user has been invited successfully"
                  : "Admin account has been set up successfully"}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                >
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            {isAdminSetup ? "Invite Admin" : "Create Admin Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
