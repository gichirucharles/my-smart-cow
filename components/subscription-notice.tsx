"use client"

import Link from "next/link"
import { AlertTriangle, CreditCard } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function SubscriptionNotice({
  amountDue,
  cowCount,
}: {
  amountDue: number
  cowCount: number
}) {
  return (
    <Alert className="mb-4 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Subscription Required</AlertTitle>
      <AlertDescription className="mt-1 space-y-2">
        <p>Your free trial has ended. You cannot add new data until you subscribe.</p>
        <p>
          Registered cows: <strong>{cowCount}</strong>. Amount due:{" "}
          <strong>KSH {amountDue.toLocaleString()}</strong> (KSH 300 per cow/month).
        </p>
        <div className="pt-1">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/subscription">
              <CreditCard className="mr-2 h-4 w-4" />
              Go to Subscriptions
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function SubscriptionAdvisoryBanner() {
  return (
    <Alert className="mb-6 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800">
      <AlertTitle>Subscriptions</AlertTitle>
      <AlertDescription className="mt-1">
        After your first month, each cow registered in the app is billed at{" "}
        <strong>KSH 300 per month</strong>. Subscribe to continue adding and managing data.
      </AlertDescription>
    </Alert>
  )
}
