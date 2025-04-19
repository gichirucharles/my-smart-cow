"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userExists = users.some((u: any) => u.email === email)

      if (userExists) {
        // In a real app, we would send an email with a reset link
        // For this demo, we'll just simulate success
        setIsSubmitted(true)

        // Store the email in localStorage for the reset page
        localStorage.setItem("resetPasswordEmail", email)
      } else {
        setError("No account found with this email address")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-md text-center space-y-4">
              <p className="text-emerald-700 dark:text-emerald-300">
                If an account exists with the email <strong>{email}</strong>, you will receive password reset
                instructions.
              </p>
              <Button
                onClick={() => router.push("/reset-password")}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Continue to Reset Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
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
