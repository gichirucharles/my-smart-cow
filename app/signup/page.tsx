"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Starting signup process", { name, email })

      // Basic validation
      if (!name || !email || !password) {
        setError("All fields are required")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      if (existingUsers.some((user: any) => user.email === email)) {
        setError("User with this email already exists")
        setIsLoading(false)
        return
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, this would be hashed
        phone: "",
        country: "Kenya",
        language: "English",
        joinDate: new Date().toISOString(),
        role: "user",
        subscription: {
          plan: "free",
          status: "trial",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }

      // Save user to localStorage
      existingUsers.push(newUser)
      localStorage.setItem("users", JSON.stringify(existingUsers))

      // Set current user (without password)
      const { password: _, ...userWithoutPassword } = newUser
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

      // Set terms as accepted
      localStorage.setItem("termsAccepted", "true")

      console.log("Signup successful", { userId: newUser.id })
      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Account created successfully! Redirecting to dashboard...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || success}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || success}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </Link>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms and Conditions
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
