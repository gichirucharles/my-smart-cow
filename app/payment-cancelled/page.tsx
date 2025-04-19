"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>Your payment process was cancelled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            You can try again or choose a different payment method from the subscription page.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/subscription">Back to Subscription</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
