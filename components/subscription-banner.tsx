"use client"

import Link from "next/link"
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useSubscriptionStatus } from "./subscription"
import { Button } from "@/components/ui/button"

export function SubscriptionBanner() {
  const { status } = useSubscriptionStatus()

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 mt-0.5" />
          <p>
            Any cow registered with the app will be billed at KSH 300 per cow after the first month of joining.
          </p>
        </div>
      </div>

      {status && !status.isTrialActive && !status.isActive && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Subscription required</p>
              <p className="mt-1">
                Your free trial has ended. You cannot add data until you pay the required amount of{" "}
                <strong>KSH {status.amountDue.toLocaleString()}</strong> (KSH {status.pricePerCow} per cow).
              </p>
              <div className="mt-2">
                <Button asChild size="sm">
                  <Link href="/subscription">Go to Subscriptions</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status && status.isTrialActive && !status.isActive && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 mt-0.5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">Free trial active</p>
              <p className="mt-1">
                You have {status.daysLeft} day{status.daysLeft === 1 ? "" : "s"} of free trial left. After that, billing is KSH {status.pricePerCow} per cow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
