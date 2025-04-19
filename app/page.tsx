"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, subDays } from "date-fns"
import { useTheme } from "next-themes"
import { BasicSidebar } from "@/components/basic-sidebar"

export default function Home() {
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [router])

  // Get user data
  const user = (() => {
    try {
      const userData = localStorage.getItem("currentUser")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  })()

  // Get farm data
  const [stats, farmName] = (() => {
    try {
      // Load farm name from settings
      let farmName = "My Smart Cow"
      const settings = localStorage.getItem("appSettings")
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        if (parsedSettings.farmName) {
          farmName = parsedSettings.farmName
        }
      }

      // Load data from localStorage
      const cows = JSON.parse(localStorage.getItem("cows") || "[]")
      const milkProductions = JSON.parse(localStorage.getItem("milkProductions") || "[]")
      const feeds = JSON.parse(localStorage.getItem("feeds") || "[]")
      const vetVisits = JSON.parse(localStorage.getItem("vetVisits") || "[]")

      // Calculate upcoming deliveries
      const today = new Date()
      const upcomingDeliveries = cows.filter(
        (cow: any) => cow.expectedDeliveryDate && new Date(cow.expectedDeliveryDate) > today,
      ).length

      // Calculate recent milk production (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd")
        const dayProductions = milkProductions.filter((p: any) => p.date === date)
        const morning = dayProductions
          .filter((p: any) => p.timeOfDay === "morning")
          .reduce((sum: number, p: any) => sum + p.amount, 0)
        const day = dayProductions
          .filter((p: any) => p.timeOfDay === "day")
          .reduce((sum: number, p: any) => sum + p.amount, 0)
        const evening = dayProductions
          .filter((p: any) => p.timeOfDay === "evening")
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        return {
          date: format(subDays(new Date(), i), "MMM dd"),
          morning,
          day,
          evening,
          total: morning + day + evening,
        }
      }).reverse()

      return [
        {
          totalCows: cows.length,
          totalMilk: milkProductions.reduce((sum: number, p: any) => sum + p.amount, 0),
          upcomingDeliveries,
          totalFeedCost: feeds.reduce((sum: number, f: any) => sum + f.cost, 0),
          totalVetCost: vetVisits.reduce((sum: number, v: any) => sum + v.cost, 0),
          recentProduction: last7Days,
        },
        farmName,
      ]
    } catch (error) {
      console.error("Error loading farm data:", error)
      return [
        {
          totalCows: 0,
          totalMilk: 0,
          upcomingDeliveries: 0,
          totalFeedCost: 0,
          totalVetCost: 0,
          recentProduction: [],
        },
        "My Smart Cow",
      ]
    }
  })()

  // If no user, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Always show the sidebar */}
      <BasicSidebar />

      {/* Main content */}
      <div className="ml-64 p-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Milk Production</h2>
            <p className="text-gray-600">View your daily milk production statistics</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Cow Health</h2>
            <p className="text-gray-600">Monitor the health status of your cows</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Feed Inventory</h2>
            <p className="text-gray-600">Track your feed and supplies inventory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
