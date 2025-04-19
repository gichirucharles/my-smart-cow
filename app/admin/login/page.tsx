"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Lock, ShieldAlert } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        // Check if user is admin
        const currentUser = localStorage.getItem("currentUser")
        if (currentUser) {
          const user = JSON.parse(currentUser)
          if (user.isAdmin) {
            router.push("/admin")
          } else {
            setError("You do not have administrator privileges")
            localStorage.removeItem("currentUser") // Log them out
          }
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Login to Admin
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
