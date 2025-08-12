"use client"

import { useEffect, useMemo, useState } from "react"

const TRIAL_DAYS = 30
const PRICE_PER_COW = 300 // KSH

export type SubscriptionStatus = {
  trialStartedAt: number
  trialEndsAt: number
  isTrialActive: boolean
  daysLeft: number
  isActive: boolean
  totalCows: number
  pricePerCow: number
  amountDue: number
}

function ensureTrialStart(): number {
  const existing = localStorage.getItem("trialStartAt")
  if (existing) return parseInt(existing, 10)
  const now = Date.now()
  localStorage.setItem("trialStartAt", String(now))
  return now
}

function getCowsCount(): number {
  try {
    const cows = JSON.parse(localStorage.getItem("cows") || "[]")
    return Array.isArray(cows) ? cows.length : 0
  } catch {
    return 0
  }
}

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)

  useEffect(() => {
    try {
      const start = ensureTrialStart()
      const ends = start + TRIAL_DAYS * 24 * 60 * 60 * 1000
      const isTrialActive = Date.now() < ends
      const daysLeft = Math.max(0, Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24)))
      const isActive = localStorage.getItem("subscriptionActive") === "true"
      const totalCows = getCowsCount()
      const amountDue = totalCows * PRICE_PER_COW

      setStatus({
        trialStartedAt: start,
        trialEndsAt: ends,
        isTrialActive,
        daysLeft,
        isActive,
        totalCows,
        pricePerCow: PRICE_PER_COW,
        amountDue,
      })
    } catch (e) {
      console.error("Subscription status error:", e)
      setStatus({
        trialStartedAt: Date.now(),
        trialEndsAt: Date.now(),
        isTrialActive: true,
        daysLeft: TRIAL_DAYS,
        isActive: false,
        totalCows: 0,
        pricePerCow: PRICE_PER_COW,
        amountDue: 0,
      })
    }
  }, [])

  // helper actions
  const activate = () => {
    localStorage.setItem("subscriptionActive", "true")
    // trigger re-eval
    const event = new Event("storage")
    window.dispatchEvent(event)
  }

  const deactivate = () => {
    localStorage.setItem("subscriptionActive", "false")
    const event = new Event("storage")
    window.dispatchEvent(event)
  }

  // subscribe to storage changes
  useEffect(() => {
    const handler = () => {
      const startStr = localStorage.getItem("trialStartAt")
      const start = startStr ? parseInt(startStr, 10) : Date.now()
      const ends = start + TRIAL_DAYS * 24 * 60 * 60 * 1000
      const isTrialActive = Date.now() < ends
      const daysLeft = Math.max(0, Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24)))
      const isActive = localStorage.getItem("subscriptionActive") === "true"
      const totalCows = getCowsCount()
      const amountDue = totalCows * PRICE_PER_COW

      setStatus({
        trialStartedAt: start,
        trialEndsAt: ends,
        isTrialActive,
        daysLeft,
        isActive,
        totalCows,
        pricePerCow: PRICE_PER_COW,
        amountDue,
      })
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const canAddData = useMemo(() => {
    if (!status) return true
    return status.isActive || status.isTrialActive
  }, [status])

  return { status, canAddData, activate, deactivate }
}
