"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Milk, DollarSign, MilkIcon as Cow, FileText } from 'lucide-react'
import { AuthGate } from "@/components/auth-gate"
import { SubscriptionBanner } from "@/components/subscription-banner"

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({
    totalCows: 0,
    milkProduced: 0,
    expenses: 0,
    upcomingDeliveries: [] as { name: string; tagNumber: string; expectedDeliveryDate: string }[],
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]

      const cows = JSON.parse(localStorage.getItem("cows") || "[]")

      const milkProductions = JSON.parse(localStorage.getItem("milkProductions") || "[]")
      const todayProductions = milkProductions.filter((p: any) => p.date === todayStr)
      const totalMilk = todayProductions.reduce((sum: number, p: any) => sum + p.amount, 0)

      const expenses = JSON.parse(localStorage.getItem("expenses") || "[]")
      const todayExpenses = expenses.filter((e: any) => e.date === todayStr)
      const totalExpenses = todayExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)

      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)

      const upcomingDeliveries = cows
        .filter((cow: any) => {
          if (!cow.expectedDeliveryDate) return false
          const deliveryDate = new Date(cow.expectedDeliveryDate)
          return deliveryDate >= today && deliveryDate <= thirtyDaysLater
        })
        .map((cow: any) => ({
          name: cow.name,
          tagNumber: cow.tagNumber,
          expectedDeliveryDate: cow.expectedDeliveryDate,
        }))

      setTodayStats({
        totalCows: cows.length,
        milkProduced: totalMilk,
        expenses: totalExpenses,
        upcomingDeliveries,
      })
    }
  }, [])

  return (
    <AuthGate>
      <div className="p-6">
        <div className="mb-6">
          <SubscriptionBanner />
        </div>

        <h1 className="text-3xl font-bold mb-6">Maziwa Smart Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Cows</h2>
            <p className="text-3xl font-bold text-emerald-600">{todayStats.totalCows}</p>
            <p className="text-gray-600 mt-2">Current herd size</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Today's Milk</h2>
            <p className="text-3xl font-bold text-emerald-600">{todayStats.milkProduced.toFixed(1)} L</p>
            <p className="text-gray-600 mt-2">Total milk produced today</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Today's Expenses</h2>
            <p className="text-3xl font-bold text-emerald-600">KSH {todayStats.expenses.toLocaleString()}</p>
            <p className="text-gray-600 mt-2">Total expenses today</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Upcoming Deliveries</h2>
            <p className="text-3xl font-bold text-emerald-600">{todayStats.upcomingDeliveries.length}</p>
            <p className="text-gray-600 mt-2">Expected in next 30 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deliveries</h2>
            {todayStats.upcomingDeliveries.length > 0 ? (
              <div className="space-y-3">
                {todayStats.upcomingDeliveries.map((cow, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{cow.name}</p>
                      <p className="text-sm text-gray-600">Tag: {cow.tagNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(cow.expectedDeliveryDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {Math.ceil((new Date(cow.expectedDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming deliveries in the next 30 days</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/production">
                <div className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                  <Milk className="h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-medium">Record Milk</p>
                </div>
              </Link>
              <Link href="/expenses">
                <div className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                  <DollarSign className="h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-medium">Add Expense</p>
                </div>
              </Link>
              <Link href="/cows">
                <div className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                  <Cow className="h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-medium">Manage Cows</p>
                </div>
              </Link>
              <Link href="/reports">
                <div className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-medium">View Reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  )
}
