"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              className="text-emerald-600"
            >
              <path
                fill="currentColor"
                d="M18.5 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75Zm2.25 2.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm-4.5 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-.75-.75ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm11.75 4.484c-.16-.293-.552-.398-.845-.238a5.5 5.5 0 0 1-5.61.141.75.75 0 0 0-.69 1.331 7 7 0 0 0 7.145-.234c.293-.16.398-.552.238-.845l-.238-.155ZM12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM4.25 12a7.75 7.75 0 1 1 15.5 0 7.75 7.75 0 0 1-15.5 0Z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Login to manage your dairy farm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Sign In</Button>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-emerald-600 hover:text-emerald-700">
              Sign up
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
              Emergency Access (Go to Dashboard)
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
