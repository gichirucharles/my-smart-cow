"use client"

import { useEffect, useMemo, useState } from "react"

const RATE_PER_COW_KSH = 300
const TRIAL_DAYS = 30

type SubscriptionState = {
  blocked: boolean
  isTrialActive: boolean
  daysLeftInTrial: number
  cowCount: number
  amountDue: number
}

/**
 * useSubscriptionGuard
 * - Persists a trial start date on first load.
 * - Uses localStorage to infer:
 *   - cowCount from stored "cows" array
 *   - subscriptionActive from "subscriptionActive" flag (boolean, optional)
 *   - Overrides trial if "subscriptionActive" is true
 */
export function useSubscriptionGuard(): SubscriptionState {
  const [now, setNow] = useState<Date>(new Date())
  const [cowCount, setCowCount] = useState<number>(0)
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false)
  const [trialStart, setTrialStart] = useState<Date | null>(null)

  // Tick to keep daysLeft responsive if the page is left open.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Ensure trial start exists
    const existing = localStorage.getItem("trialStart")
    if (!existing) {
      const iso = new Date().toISOString()
      localStorage.setItem("trialStart", iso)
      setTrialStart(new Date(iso))
    } else {
      const d = new Date(existing)
      if (!Number.isNaN(d.getTime())) {
        setTrialStart(d)
      } else {
        // Reset invalid stored value
        const iso = new Date().toISOString()
        localStorage.setItem("trialStart", iso)
        setTrialStart(new Date(iso))
      }
    }

    // Subscription active flag (optional; toggle elsewhere when user pays)
    const sub = localStorage.getItem("subscriptionActive")
    setSubscriptionActive(sub === "true")

    // Cow count
    const cowsRaw = localStorage.getItem("cows")
    if (cowsRaw) {
      try {
        const parsed = JSON.parse(cowsRaw)
        setCowCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch {
        setCowCount(0)
      }
    } else {
      setCowCount(0)
    }
  }, [])

  const { isTrialActive, daysLeftInTrial } = useMemo(() => {
    if (!trialStart) {
      return { isTrialActive: true, daysLeftInTrial: TRIAL_DAYS }
    }
    const msElapsed = now.getTime() - trialStart.getTime()
    const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24))
    const left = Math.max(TRIAL_DAYS - daysElapsed, 0)
    return { isTrialActive: left > 0, daysLeftInTrial: left }
  }, [now, trialStart])

  const amountDue = cowCount * RATE_PER_COW_KSH
  // Block adding data when trial ended and subscription is not active
  const blocked = !isTrialActive && !subscriptionActive && cowCount > 0

  return {
    blocked,
    isTrialActive,
    daysLeftInTrial,
    cowCount,
    amountDue,
  }
}

/**
 * Helpers to activate/deactivate subscription (simulate payment).
 * You can call these in payment success pages or server action callbacks.
 */
export function activateSubscription() {
  if (typeof window === "undefined") return
  localStorage.setItem("subscriptionActive", "true")
}
export function deactivateSubscription() {
  if (typeof window === "undefined") return
  localStorage.setItem("subscriptionActive", "false")
}
export const RATE_PER_COW = RATE_PER_COW_KSH
export const TRIAL_LENGTH_DAYS = TRIAL_DAYS
