"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Milk,
  Beef,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Plus,
  Eye,
  Activity,
  Droplets,
  Heart,
  Truck,
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface DashboardStats {
  totalCows: number
  milkingCows: number
  todayMilk: number
  weeklyMilk: number
  monthlyExpenses: number
  profitMargin: number
  sickCows: number
  upcomingDeliveries: number
  feedingStatus: {
    fed: number
    pending: number
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalCows: 0,
    milkingCows: 0,
    todayMilk: 0,
    weeklyMilk: 0,
    monthlyExpenses: 0,
    profitMargin: 0,
    sickCows: 0,
    upcomingDeliveries: 0,
    feedingStatus: { fed: 0, pending: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      // Load data from localStorage
      const cows = JSON.parse(localStorage.getItem("cows") || "[]")
      const production = JSON.parse(localStorage.getItem("milk_production") || "[]")
      const expenses = JSON.parse(localStorage.getItem("expenses") || "[]")
      const feeding = JSON.parse(localStorage.getItem("cow_feeding") || "[]")

      // Calculate stats
      const totalCows = cows.length
      const milkingCows = cows.filter((cow: any) => cow.status === "milking").length
      const sickCows = cows.filter((cow: any) => cow.health_status === "sick").length

      // Today's milk production
      const today = new Date().toISOString().split("T")[0]
      const todayProduction = production.filter((p: any) => p.date === today)
      const todayMilk = todayProduction.reduce(
        (sum: number, p: any) => sum + (p.morning_milk || 0) + (p.evening_milk || 0),
        0,
      )

      // Weekly milk production
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const weeklyProduction = production.filter((p: any) => p.date >= weekAgo)
      const weeklyMilk = weeklyProduction.reduce(
        (sum: number, p: any) => sum + (p.morning_milk || 0) + (p.evening_milk || 0),
        0,
      )

      // Monthly expenses
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const monthlyExpensesList = expenses.filter((e: any) => e.date >= monthAgo)
      const monthlyExpenses = monthlyExpensesList.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)

      // Profit margin calculation (simplified)
      const avgMilkPrice = 50 // KES per liter
      const weeklyRevenue = weeklyMilk * avgMilkPrice
      const weeklyExpenses = expenses
        .filter((e: any) => e.date >= weekAgo)
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      const profitMargin = weeklyRevenue > 0 ? ((weeklyRevenue - weeklyExpenses) / weeklyRevenue) * 100 : 0

      // Upcoming deliveries (cows due in next 30 days)
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const upcomingDeliveries = cows.filter((cow: any) => {
        if (cow.expected_delivery_date) {
          const deliveryDate = new Date(cow.expected_delivery_date)
          return deliveryDate <= thirtyDaysFromNow && deliveryDate >= new Date()
        }
        return false
      }).length

      // Feeding status
      const todayFeeding = feeding.filter((f: any) => f.date === today)
      const fedCows = new Set(todayFeeding.map((f: any) => f.cow_id)).size
      const pendingFeeding = milkingCows - fedCows

      setStats({
        totalCows,
        milkingCows,
        todayMilk,
        weeklyMilk,
        monthlyExpenses,
        profitMargin,
        sickCows,
        upcomingDeliveries,
        feedingStatus: { fed: fedCows, pending: pendingFeeding },
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name?.split(" ")[0] || "Farmer"}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening at {user?.farm_name || "your farm"} today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/production">
              <Plus className="mr-2 h-4 w-4" />
              Record Milk
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cows</CardTitle>
            <Beef className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCows}</div>
            <p className="text-xs text-muted-foreground">{stats.milkingCows} currently milking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Milk</CardTitle>
            <Milk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMilk.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">{stats.weeklyMilk.toFixed(1)}L this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Weekly performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Alerts */}
        {stats.sickCows > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>
                {stats.sickCows} cow{stats.sickCows > 1 ? "s" : ""}
              </strong>{" "}
              need medical attention.
              <Button variant="link" className="p-0 h-auto text-red-600" asChild>
                <Link href="/veterinary"> View details</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Feeding Status */}
        {stats.feedingStatus.pending > 0 && (
          <Alert className="border-amber-200 bg-amber-50">
            <Droplets className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>
                {stats.feedingStatus.pending} cow{stats.feedingStatus.pending > 1 ? "s" : ""}
              </strong>{" "}
              haven't been fed today.
              <Button variant="link" className="p-0 h-auto text-amber-600" asChild>
                <Link href="/cow-feeding"> Feed now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Upcoming Deliveries */}
        {stats.upcomingDeliveries > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>
                {stats.upcomingDeliveries} cow{stats.upcomingDeliveries > 1 ? "s" : ""}
              </strong>{" "}
              due for delivery in 30 days.
              <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
                <Link href="/cows"> View schedule</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/production">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Record Production</CardTitle>
              <Plus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Add today's milk production data</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/expenses">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add Expense</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Record farm expenses and costs</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/cows">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Cows</CardTitle>
              <Beef className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View and update cow information</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/reports">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">View Reports</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Analyze farm performance data</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Farm Status</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-600" />
                <span className="text-sm">Healthy Cows</span>
              </div>
              <Badge variant="secondary">{stats.totalCows - stats.sickCows}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Active Milkers</span>
              </div>
              <Badge variant="secondary">{stats.milkingCows}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-green-600" />
                <span className="text-sm">Fed Today</span>
              </div>
              <Badge variant="secondary">{stats.feedingStatus.fed}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Upcoming Deliveries</span>
              </div>
              <Badge variant="secondary">{stats.upcomingDeliveries}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Daily Average</span>
                <span className="font-medium">{(stats.weeklyMilk / 7).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.todayMilk / (stats.weeklyMilk / 7)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Feeding Progress</span>
                <span className="font-medium">
                  {stats.feedingStatus.fed}/{stats.milkingCows}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats.milkingCows > 0 ? (stats.feedingStatus.fed / stats.milkingCows) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
