"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "./auth-provider"

export function SubscriptionExpiredDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user's subscription has expired
    if (user) {
      const isExpired = user.subscription.status === "inactive"
      const isTrialExpired =
        user.subscription.status === "trial" && new Date(user.subscription.trialEndsAt) < new Date()

      if (isExpired || isTrialExpired) {
        setOpen(true)
      }
    }
  }, [user])

  const handleUpgrade = () => {
    setOpen(false)
    router.push("/subscription")
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Subscription Expired
          </DialogTitle>
          <DialogDescription>
            {user.subscription.status === "trial"
              ? "Your free trial period has ended."
              : "Your subscription has expired."}
            Please choose a subscription plan to continue using all features of the application.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              You currently have limited access to the application. Upgrade now to unlock all features.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleUpgrade}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Upgrade Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
