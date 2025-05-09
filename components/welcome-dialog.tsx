"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format, addMonths, isValid } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { SnowflakeIcon as Confetti } from "lucide-react"

export function WelcomeDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null)

  useEffect(() => {
    // Check if this is a new user
    if (user) {
      const welcomeShown = localStorage.getItem(`welcome_shown_${user.id}`)
      if (!welcomeShown) {
        try {
          // Use current date if createdAt is not available
          const createdAt = user.createdAt ? new Date(user.createdAt) : new Date()

          // Validate the date is valid before using it
          if (!isValid(createdAt)) {
            console.error("Invalid createdAt date, using current date instead")
            const currentDate = new Date()
            const endDate = addMonths(currentDate, 1)
            setTrialEndDate(endDate)
          } else {
            // Calculate trial end date
            const endDate = addMonths(createdAt, 1)
            setTrialEndDate(endDate)
          }

          // Show dialog after a short delay
          setTimeout(() => {
            setOpen(true)
          }, 1000)
        } catch (error) {
          console.error("Error calculating trial end date:", error)
          // Use current date + 1 month as fallback
          const fallbackDate = addMonths(new Date(), 1)
          setTrialEndDate(fallbackDate)
        }
      }
    }
  }, [user])

  const handleClose = () => {
    setOpen(false)
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, "true")
    }
  }

  // Don't render if user is not available or if we couldn't calculate a valid trial end date
  if (!user || !trialEndDate || !isValid(trialEndDate)) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Confetti className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="text-center text-xl mt-4">Welcome to My Smart Cow, {user?.name || ""}!</DialogTitle>
          <DialogDescription className="text-center">
            {user?.farmName ? `${user.farmName} - ` : ""}Congratulations on joining our platform!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-center">
          <p>
            You're now on a <span className="font-bold text-emerald-600 dark:text-emerald-400">1-month free trial</span>{" "}
            of our platform.
          </p>
          <p>
            Your trial will end on <span className="font-bold">{format(trialEndDate, "MMMM dd, yyyy")}</span>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enjoy all premium features during your trial period. After that, you can choose a subscription plan that
            fits your needs.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
