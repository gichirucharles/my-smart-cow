"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("resetPasswordEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email is stored, redirect to forgot password page
      router.push("/forgot-password")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user password in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((user: any) => {
        if (user.email === email) {
          return { ...user, password: newPassword }
        }
        return user
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      setIsSuccess(true)

      // Clear the reset email from localStorage
      localStorage.removeItem("resetPasswordEmail")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <path
                fill="currentColor"
                d="M18.5 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75Zm2.25 2.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm-4.5 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-.75-.75ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm11.75 4.484c-.16-.293-.552-.398-.845-.238a5.5 5.5 0 0 1-5.61.141.75.75 0 0 0-.69 1.331 7 7 0 0 0 7.145-.234c.293-.16.398-.552.238-.845l-.238-.155ZM12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM4.25 12a7.75 7.75 0 1 1 15.5 0 7.75 7.75 0 0 1-15.5 0Z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-center">Create New Password</CardTitle>
          <CardDescription className="text-center">Enter a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-md text-center space-y-4">
              <p className="text-emerald-700 dark:text-emerald-300">Your password has been successfully reset!</p>
              <Button
                onClick={() => router.push("/login")}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className="bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
