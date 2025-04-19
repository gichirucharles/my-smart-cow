"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, MilkIcon, Stethoscope, Wheat } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

// Helper functions to replace date-fns
const formatDate = (date, formatStr) => {
  if (formatStr === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0]
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: formatStr.includes("MMM") ? "short" : "2-digit",
    day: "2-digit",
  })
}

const parseISO = (dateStr) => new Date(dateStr)

const subDays = (date, days) => {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() - days)
  return newDate
}

const subMonths = (date, months) => {
  const newDate = new Date(date)
  newDate.setMonth(date.getMonth() - months)
  return newDate
}

const subWeeks = (date, weeks) => {
  return subDays(date, weeks * 7)
}

const isAfter = (date1, date2) => date1 > date2
const isBefore = (date1, date2) => date1 < date2

const startOfDay = (date) => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

const endOfDay = (date) => {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

// Types
interface Cow {
  id: string
  tagNumber: string
  name: string
  expectedDeliveryDate: string
  aiDates: string[]
}

interface MilkProduction {
  id: string
  cowId: string
  date: string
  timeOfDay: "morning" | "day" | "evening"
  amount: number
}

interface VetVisit {
  id: string
  cowId: string
  date: string
  reason: string
  diagnosis: string
  cost: number
}

interface Feed {
  id: string
  date: string
  type: string
  quantity: number
  cost: number
}

interface Vendor {
  id: string
  name: string
  phone: string
}

interface MilkCollection {
  id: string
  vendorId: string
  date: string
  time: string
  quantity: number
  price: number
}

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  country: string
  language: string
  joinDate: string
}

export default function ReportsPage() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [cows, setCows] = useState<Cow[]>([])
  const [productions, setProductions] = useState<MilkProduction[]>([])
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [collections, setCollections] = useState<MilkCollection[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Default milk price per liter (if not specified in collections)
  const DEFAULT_MILK_PRICE = 45 // KSH

  // Report period state
  const [reportPeriod, setReportPeriod] = useState<"day" | "week" | "month" | "year" | "custom">("month")
  const [startDate, setStartDate] = useState(formatDate(subMonths(new Date(), 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(formatDate(new Date(), "yyyy-MM-dd"))
  const [currency, setCurrency] = useState("KSH")

  // Report export settings
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf" | "excel">("csv")
  const [selectedReports, setSelectedReports] = useState({
    milkProduction: true,
    vetCosts: true,
    feedCosts: true,
    vendorCollections: true,
    financialSummary: true,
  })
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoading(true)

      // Load data with a slight delay to ensure UI renders first
      setTimeout(() => {
        try {
          const savedCows = localStorage.getItem("cows")
          if (savedCows) setCows(JSON.parse(savedCows))

          const savedProductions = localStorage.getItem("milkProductions")
          if (savedProductions) setProductions(JSON.parse(savedProductions))

          const savedVetVisits = localStorage.getItem("vetVisits")
          if (savedVetVisits) setVetVisits(JSON.parse(savedVetVisits))

          const savedFeeds = localStorage.getItem("feeds")
          if (savedFeeds) setFeeds(JSON.parse(savedFeeds))

          const savedVendors = localStorage.getItem("vendors")
          if (savedVendors) setVendors(JSON.parse(savedVendors))

          const savedCollections = localStorage.getItem("milkCollections")
          if (savedCollections) setCollections(JSON.parse(savedCollections))

          const savedExpenses = localStorage.getItem("expenses")
          if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

          const savedUser = localStorage.getItem("currentUser")
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)

            // Set currency based on user's country
            if (parsedUser.country === "Kenya") setCurrency("KSH")
            else if (parsedUser.country === "Uganda") setCurrency("UGX")
            else if (parsedUser.country === "Tanzania") setCurrency("TZS")
            else if (parsedUser.country === "United States") setCurrency("USD")
            else if (parsedUser.country === "United Kingdom") setCurrency("GBP")
            else setCurrency("KSH") // Default
          }

          // If no data exists, create sample data for demonstration
          if (!savedProductions || JSON.parse(savedProductions).length === 0) {
            createSampleData()
          }

          // Load report settings from app settings
          const appSettings = localStorage.getItem("appSettings")
          if (appSettings) {
            const settings = JSON.parse(appSettings)
            if (settings.reportSettings) {
              setExportFormat(settings.reportSettings.defaultFormat || "csv")
              setIncludeHeaders(settings.reportSettings.includeHeaders !== false)

              // Set report period based on settings
              if (settings.reportSettings.dateRange) {
                setReportPeriod(settings.reportSettings.dateRange)
                updateDateRange(settings.reportSettings.dateRange)
              }
            }
          }
        } catch (error) {
          console.error("Error loading data:", error)
          // Create sample data if there's an error
          createSampleData()
        }

        setIsLoading(false)
      }, 500)
    }
  }, [])

  // Update date range when period changes
  const updateDateRange = (period: "day" | "week" | "month" | "year" | "custom") => {
    const today = new Date()

    switch (period) {
      case "day":
        setStartDate(formatDate(today, "yyyy-MM-dd"))
        setEndDate(formatDate(today, "yyyy-MM-dd"))
        break
      case "week":
        setStartDate(formatDate(subDays(today, 7), "yyyy-MM-dd"))
        setEndDate(formatDate(today, "yyyy-MM-dd"))
        break
      case "month":
        setStartDate(formatDate(subMonths(today, 1), "yyyy-MM-dd"))
        setEndDate(formatDate(today, "yyyy-MM-dd"))
        break
      case "year":
        setStartDate(formatDate(subMonths(today, 12), "yyyy-MM-dd"))
        setEndDate(formatDate(today, "yyyy-MM-dd"))
        break
      // For custom, don't change the dates
    }
  }

  useEffect(() => {
    updateDateRange(reportPeriod)
  }, [reportPeriod])

  // Create sample data for demonstration if no data exists
  const createSampleData = () => {
    // Sample cows if none exist
    if (cows.length === 0) {
      const sampleCows = [
        {
          id: "cow1",
          tagNumber: "C001",
          name: "Daisy",
          expectedDeliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          aiDates: [new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()],
        },
        {
          id: "cow2",
          tagNumber: "C002",
          name: "Bella",
          expectedDeliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          aiDates: [new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()],
        },
      ]
      setCows(sampleCows)
      localStorage.setItem("cows", JSON.stringify(sampleCows))
    }

    // Sample milk production data
    const sampleProductions = []
    const today = new Date()

    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date, "yyyy-MM-dd")

      // Morning production
      sampleProductions.push({
        id: `prod-${i}-morning`,
        cowId: "cow1",
        date: dateStr,
        timeOfDay: "morning",
        amount: 5 + Math.random() * 3, // 5-8 liters
      })

      // Day production
      sampleProductions.push({
        id: `prod-${i}-day`,
        cowId: "cow1",
        date: dateStr,
        timeOfDay: "day",
        amount: 4 + Math.random() * 2, // 4-6 liters
      })

      // Evening production
      sampleProductions.push({
        id: `prod-${i}-evening`,
        cowId: "cow1",
        date: dateStr,
        timeOfDay: "evening",
        amount: 4.5 + Math.random() * 2.5, // 4.5-7 liters
      })

      // Add some data for cow2
      if (i % 2 === 0) {
        sampleProductions.push({
          id: `prod-${i}-morning-cow2`,
          cowId: "cow2",
          date: dateStr,
          timeOfDay: "morning",
          amount: 4 + Math.random() * 2, // 4-6 liters
        })

        sampleProductions.push({
          id: `prod-${i}-evening-cow2`,
          cowId: "cow2",
          date: dateStr,
          timeOfDay: "evening",
          amount: 3.5 + Math.random() * 2, // 3.5-5.5 liters
        })
      }
    }

    setProductions(sampleProductions)
    localStorage.setItem("milkProductions", JSON.stringify(sampleProductions))

    // Sample vet visits
    const sampleVetVisits = [
      {
        id: "vet1",
        cowId: "cow1",
        date: formatDate(subDays(today, 15), "yyyy-MM-dd"),
        reason: "Routine Checkup",
        diagnosis: "Healthy",
        cost: 1500,
      },
      {
        id: "vet2",
        cowId: "cow2",
        date: formatDate(subDays(today, 10), "yyyy-MM-dd"),
        reason: "Vaccination",
        diagnosis: "Administered vaccines",
        cost: 2000,
      },
      {
        id: "vet3",
        cowId: "cow1",
        date: formatDate(subDays(today, 5), "yyyy-MM-dd"),
        reason: "Mastitis Treatment",
        diagnosis: "Mild mastitis, treated with antibiotics",
        cost: 3000,
      },
    ]

    setVetVisits(sampleVetVisits)
    localStorage.setItem("vetVisits", JSON.stringify(sampleVetVisits))

    // Sample feeds
    const sampleFeeds = [
      {
        id: "feed1",
        date: formatDate(subDays(today, 20), "yyyy-MM-dd"),
        type: "Hay",
        quantity: 100,
        cost: 5000,
      },
      {
        id: "feed2",
        date: formatDate(subDays(today, 15), "yyyy-MM-dd"),
        type: "Dairy Meal",
        quantity: 50,
        cost: 3000,
      },
      {
        id: "feed3",
        date: formatDate(subDays(today, 7), "yyyy-MM-dd"),
        type: "Silage",
        quantity: 200,
        cost: 8000,
      },
      {
        id: "feed4",
        date: formatDate(subDays(today, 3), "yyyy-MM-dd"),
        type: "Concentrates",
        quantity: 30,
        cost: 4500,
      },
    ]

    setFeeds(sampleFeeds)
    localStorage.setItem("feeds", JSON.stringify(sampleFeeds))

    // Sample vendors
    const sampleVendors = [
      {
        id: "vendor1",
        name: "Local Dairy Cooperative",
        phone: "0712345678",
      },
      {
        id: "vendor2",
        name: "Premium Milk Processors",
        phone: "0723456789",
      },
    ]

    setVendors(sampleVendors)
    localStorage.setItem("vendors", JSON.stringify(sampleVendors))

    // Sample milk collections
    const sampleCollections = []

    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i * 3) // Every 3 days

      sampleCollections.push({
        id: `coll-${i}`,
        vendorId: i % 2 === 0 ? "vendor1" : "vendor2",
        date: formatDate(date, "yyyy-MM-dd"),
        time: "08:00",
        quantity: 30 + Math.random() * 20, // 30-50 liters
        price: 45, // KSH per liter
      })
    }

    setCollections(sampleCollections)
    localStorage.setItem("milkCollections", JSON.stringify(sampleCollections))

    // Sample expenses
    const sampleExpenses = [
      {
        id: "exp1",
        date: formatDate(subDays(today, 25), "yyyy-MM-dd"),
        category: "Utilities",
        description: "Electricity bill",
        amount: 2000,
      },
      {
        id: "exp2",
        date: formatDate(subDays(today, 18), "yyyy-MM-dd"),
        category: "Labor",
        description: "Farm worker wages",
        amount: 5000,
      },
      {
        id: "exp3",
        date: formatDate(subDays(today, 12), "yyyy-MM-dd"),
        category: "Equipment",
        description: "Milking machine maintenance",
        amount: 3500,
      },
      {
        id: "exp4",
        date: formatDate(subDays(today, 5), "yyyy-MM-dd"),
        category: "Supplies",
        description: "Cleaning supplies",
        amount: 1200,
      },
    ]

    setExpenses(sampleExpenses)
    localStorage.setItem("expenses", JSON.stringify(sampleExpenses))
  }

  // Filter data based on selected date range
  const filterByDateRange = <T extends { date: string }>(items: T[]): T[] => {
    const start = startOfDay(parseISO(startDate))
    const end = endOfDay(parseISO(endDate))

    return items.filter((item) => {
      const itemDate = parseISO(item.date)
      return itemDate >= start && itemDate <= end
    })
  }

  const filteredProductions = filterByDateRange(productions)
  const filteredVetVisits = filterByDateRange(vetVisits)
  const filteredFeeds = filterByDateRange(feeds)
  const filteredCollections = filterByDateRange(collections)
  const filteredExpenses = filterByDateRange(expenses)

  // Prepare data for milk production chart
  const monthlyProductionData = (() => {
    // Determine the number of data points based on the period
    let dataPoints: Date[] = []
    const endDateObj = parseISO(endDate)

    if (reportPeriod === "day") {
      // For day, show hourly data
      dataPoints = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(endDateObj)
        date.setHours(i, 0, 0, 0)
        return date
      })
    } else if (reportPeriod === "week") {
      // For week, show daily data
      dataPoints = Array.from({ length: 7 }, (_, i) => {
        return subDays(endDateObj, 6 - i)
      })
    } else if (reportPeriod === "month") {
      // For month, show weekly data
      dataPoints = Array.from({ length: 4 }, (_, i) => {
        return subWeeks(endDateObj, 3 - i)
      })
    } else {
      // For year or custom, show monthly data
      const months =
        reportPeriod === "year"
          ? 12
          : Math.ceil((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / (30 * 24 * 60 * 60 * 1000))
      dataPoints = Array.from({ length: Math.min(months, 12) }, (_, i) => {
        return subMonths(endDateObj, months - 1 - i)
      })
    }

    return dataPoints.map((date) => {
      let relevantProductions: MilkProduction[] = []

      if (reportPeriod === "day") {
        // For day, filter by hour
        const hour = date.getHours()
        relevantProductions = filteredProductions.filter((p) => {
          const prodDate = parseISO(p.date)
          return (
            prodDate.getDate() === date.getDate() &&
            prodDate.getMonth() === date.getMonth() &&
            prodDate.getFullYear() === date.getFullYear() &&
            prodDate.getHours() === hour
          )
        })
      } else if (reportPeriod === "week") {
        // For week, filter by day
        relevantProductions = filteredProductions.filter((p) => {
          const prodDate = parseISO(p.date)
          return (
            prodDate.getDate() === date.getDate() &&
            prodDate.getMonth() === date.getMonth() &&
            prodDate.getFullYear() === date.getFullYear()
          )
        })
      } else if (reportPeriod === "month") {
        // For month, filter by week
        const weekStart = subDays(date, 3)
        const weekEnd = subDays(date, -3)
        relevantProductions = filteredProductions.filter((p) => {
          const prodDate = parseISO(p.date)
          return isAfter(prodDate, weekStart) && isBefore(prodDate, weekEnd)
        })
      } else {
        // For year or custom, filter by month
        relevantProductions = filteredProductions.filter((p) => {
          const prodDate = parseISO(p.date)
          return prodDate.getMonth() === date.getMonth() && prodDate.getFullYear() === date.getFullYear()
        })
      }

      const morning = relevantProductions.filter((p) => p.timeOfDay === "morning").reduce((sum, p) => sum + p.amount, 0)
      const day = relevantProductions.filter((p) => p.timeOfDay === "day").reduce((sum, p) => sum + p.amount, 0)
      const evening = relevantProductions.filter((p) => p.timeOfDay === "evening").reduce((sum, p) => sum + p.amount, 0)

      return {
        name:
          reportPeriod === "day"
            ? `${date.getHours()}:00`
            : reportPeriod === "week"
              ? formatDate(date, "EEE")
              : reportPeriod === "month"
                ? `Week ${Math.floor(date.getDate() / 7) + 1}`
                : formatDate(date, "MMM yyyy"),
        morning,
        day,
        evening,
        total: morning + day + evening,
      }
    })
  })()

  // Prepare data for vet costs chart
  const vetCostsByReason: Record<string, number> = {}
  filteredVetVisits.forEach((visit) => {
    if (!vetCostsByReason[visit.reason]) {
      vetCostsByReason[visit.reason] = 0
    }
    vetCostsByReason[visit.reason] += visit.cost
  })

  const vetPieData = Object.entries(vetCostsByReason).map(([name, value]) => ({
    name,
    value,
  }))

  // Prepare data for feed costs chart
  const feedCostsByType: Record<string, number> = {}
  filteredFeeds.forEach((feed) => {
    if (!feedCostsByType[feed.type]) {
      feedCostsByType[feed.type] = 0
    }
    feedCostsByType[feed.type] += feed.cost
  })

  const feedPieData = Object.entries(feedCostsByType).map(([name, value]) => ({
    name,
    value,
  }))

  // Prepare data for vendor collections
  const vendorCollectionData = vendors
    .map((vendor) => {
      const vendorCollections = filteredCollections.filter((c) => c.vendorId === vendor.id)
      const quantity = vendorCollections.reduce((sum, c) => sum + c.quantity, 0)
      const value = vendorCollections.reduce((sum, c) => sum + c.quantity * c.price, 0)

      return {
        name: vendor.name,
        quantity,
        value,
      }
    })
    .filter((data) => data.quantity > 0) // Only show vendors with collections

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"]

  // Calculate total milk production
  const totalMilkProduction = filteredProductions.reduce((sum, p) => sum + p.amount, 0)

  // Calculate total revenue from milk sales
  // If we have collections with prices, use those, otherwise use the default price
  const milkSalesRevenue =
    filteredCollections.length > 0
      ? filteredCollections.reduce((sum, c) => sum + c.quantity * c.price, 0)
      : totalMilkProduction * DEFAULT_MILK_PRICE

  // Calculate total expenses
  const totalVetCosts = filteredVetVisits.reduce((sum, v) => sum + v.cost, 0)
  const totalFeedCosts = filteredFeeds.reduce((sum, f) => sum + f.cost, 0)
  const totalOtherExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = totalVetCosts + totalFeedCosts + totalOtherExpenses

  // Calculate net income
  const netIncome = milkSalesRevenue - totalExpenses

  // Convert data to CSV format
  const convertToCSV = (data: any[], headers: string[] = []): string => {
    if (data.length === 0) return ""

    let csv = ""

    // Add headers if includeHeaders is true
    if (includeHeaders && headers.length > 0) {
      csv += headers.join(",") + "\n"
    } else if (includeHeaders) {
      // Use object keys as headers if no headers provided
      csv += Object.keys(data[0]).join(",") + "\n"
    }

    // Add data rows
    data.forEach((item) => {
      const values = Object.values(item).map((value) => {
        // Handle strings with commas by wrapping in quotes
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`
        }
        return value
      })
      csv += values.join(",") + "\n"
    })

    return csv
  }

  // Export reports data
  const exportReports = () => {
    // Prepare data based on selected reports
    const exportData: any = {}

    if (selectedReports.milkProduction) {
      exportData.milkProduction = {
        summary: {
          byTimeOfDay: {
            morning: filteredProductions.filter((p) => p.timeOfDay === "morning").reduce((sum, p) => sum + p.amount, 0),
            day: filteredProductions.filter((p) => p.timeOfDay === "day").reduce((sum, p) => sum + p.amount, 0),
            evening: filteredProductions.filter((p) => p.timeOfDay === "evening").reduce((sum, p) => sum + p.amount, 0),
          },
          total: totalMilkProduction,
        },
        details: filteredProductions.map((p) => {
          const cow = cows.find((c) => c.id === p.cowId)
          return {
            date: p.date,
            cow: cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown",
            timeOfDay: p.timeOfDay,
            amount: p.amount,
          }
        }),
      }
    }

    if (selectedReports.vetCosts) {
      exportData.vetCosts = {
        summary: {
          byReason: vetCostsByReason,
          total: totalVetCosts,
        },
        details: filteredVetVisits.map((v) => {
          const cow = cows.find((c) => c.id === v.cowId)
          return {
            date: v.date,
            cow: cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown",
            reason: v.reason,
            diagnosis: v.diagnosis,
            cost: v.cost,
          }
        }),
      }
    }

    if (selectedReports.feedCosts) {
      exportData.feedCosts = {
        summary: {
          byType: feedCostsByType,
          total: totalFeedCosts,
        },
        details: filteredFeeds.map((f) => ({
          date: f.date,
          type: f.type,
          quantity: f.quantity,
          cost: f.cost,
        })),
      }
    }

    if (selectedReports.vendorCollections) {
      exportData.vendorCollections = {
        summary: vendorCollectionData,
        details: filteredCollections.map((c) => {
          const vendor = vendors.find((v) => v.id === c.vendorId)
          return {
            date: c.date,
            vendor: vendor ? vendor.name : "Unknown",
            quantity: c.quantity,
            price: c.price,
            value: c.quantity * c.price,
          }
        }),
      }
    }

    if (selectedReports.financialSummary) {
      exportData.financialSummary = {
        totalProduction: totalMilkProduction,
        totalRevenue: milkSalesRevenue,
        totalExpenses: {
          vetCosts: totalVetCosts,
          feedCosts: totalFeedCosts,
          otherExpenses: totalOtherExpenses,
          total: totalExpenses,
        },
        netIncome: netIncome,
      }
    }

    // Generate file based on selected format
    let fileContent = ""
    let fileName = `dairy-farm-reports-${formatDate(new Date(), "yyyy-MM-dd")}`
    let mimeType = ""

    if (exportFormat === "csv") {
      // For CSV, we need to create separate files for each report section
      // For simplicity, we'll combine them with section headers
      fileContent = `Smart Cow Farm Report\nDate Range: ${startDate} to ${endDate}\n\n`

      if (selectedReports.milkProduction) {
        fileContent += "MILK PRODUCTION SUMMARY\n"
        fileContent += `Total Production,${totalMilkProduction.toFixed(1)} L\n`
        fileContent += `Morning,${exportData.milkProduction.summary.byTimeOfDay.morning.toFixed(1)} L\n`
        fileContent += `Day,${exportData.milkProduction.summary.byTimeOfDay.day.toFixed(1)} L\n`
        fileContent += `Evening,${exportData.milkProduction.summary.byTimeOfDay.evening.toFixed(1)} L\n\n`

        fileContent += "MILK PRODUCTION DETAILS\n"
        fileContent += convertToCSV(exportData.milkProduction.details, ["Date", "Cow", "Time of Day", "Amount (L)"])
        fileContent += "\n"
      }

      if (selectedReports.vetCosts) {
        fileContent += "VETERINARY COSTS SUMMARY\n"
        fileContent += `Total Vet Costs,${currency} ${totalVetCosts.toLocaleString()}\n\n`
        fileContent += "Costs by Reason\n"
        Object.entries(vetCostsByReason).forEach(([reason, cost]) => {
          fileContent += `${reason},${currency} ${cost.toLocaleString()}\n`
        })
        fileContent += "\n"

        fileContent += "VETERINARY DETAILS\n"
        fileContent += convertToCSV(exportData.vetCosts.details, ["Date", "Cow", "Reason", "Diagnosis", "Cost"])
        fileContent += "\n"
      }

      if (selectedReports.feedCosts) {
        fileContent += "FEED COSTS SUMMARY\n"
        fileContent += `Total Feed Costs,${currency} ${totalFeedCosts.toLocaleString()}\n\n`
        fileContent += "Costs by Type\n"
        Object.entries(feedCostsByType).forEach(([type, cost]) => {
          fileContent += `${type},${currency} ${cost.toLocaleString()}\n`
        })
        fileContent += "\n"

        fileContent += "FEED DETAILS\n"
        fileContent += convertToCSV(exportData.feedCosts.details, ["Date", "Type", "Quantity (kg)", "Cost"])
        fileContent += "\n"
      }

      if (selectedReports.vendorCollections) {
        fileContent += "VENDOR COLLECTIONS SUMMARY\n"
        vendorCollectionData.forEach((vendor) => {
          fileContent += `${vendor.name},${vendor.quantity.toFixed(1)} L,${currency} ${vendor.value.toLocaleString()}\n`
        })
        fileContent += "\n"

        fileContent += "VENDOR COLLECTION DETAILS\n"
        fileContent += convertToCSV(exportData.vendorCollections.details, [
          "Date",
          "Vendor",
          "Quantity (L)",
          "Price",
          "Value",
        ])
        fileContent += "\n"
      }

      if (selectedReports.financialSummary) {
        fileContent += "FINANCIAL SUMMARY\n"
        fileContent += `Total Revenue,${currency} ${milkSalesRevenue.toLocaleString()}\n`
        fileContent += `Total Expenses,${currency} ${totalExpenses.toLocaleString()}\n`
        fileContent += `Net Income,${currency} ${netIncome.toLocaleString()}\n\n`

        fileContent += "Expense Breakdown\n"
        fileContent += `Veterinary Costs,${currency} ${totalVetCosts.toLocaleString()}\n`
        fileContent += `Feed Costs,${currency} ${totalFeedCosts.toLocaleString()}\n`
        fileContent += `Other Expenses,${currency} ${totalOtherExpenses.toLocaleString()}\n`
      }

      fileName += ".csv"
      mimeType = "text/csv"
    } else if (exportFormat === "json") {
      fileContent = JSON.stringify(exportData, null, 2)
      fileName += ".json"
      mimeType = "application/json"
    } else {
      // For PDF and Excel, we would need additional libraries
      // For now, we'll just use JSON as a fallback
      fileContent = JSON.stringify(exportData, null, 2)
      fileName += ".json"
      mimeType = "application/json"

      toast({
        title: "Format not supported",
        description: `${exportFormat.toUpperCase()} export is not available in this version. Using JSON instead.`,
        variant: "destructive",
      })
    }

    // Create and download the file
    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report exported",
      description: `Your report has been exported as ${fileName}`,
    })
  }

  // Export current tab report only
  const exportCurrentTabReport = (tabValue: string) => {
    // Reset all report selections to false
    const newSelectedReports = {
      milkProduction: false,
      vetCosts: false,
      feedCosts: false,
      vendorCollections: false,
      financialSummary: false,
    }

    // Set only the current tab to true
    switch (tabValue) {
      case "milk":
        newSelectedReports.milkProduction = true
        break
      case "vet":
        newSelectedReports.vetCosts = true
        break
      case "feed":
        newSelectedReports.feedCosts = true
        break
      case "vendors":
        newSelectedReports.vendorCollections = true
        break
      case "summary":
        newSelectedReports.financialSummary = true
        break
    }

    setSelectedReports(newSelectedReports)
    exportReports()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Comprehensive Reports</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Comprehensive Reports</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <p className="text-gray-600 dark:text-gray-400">
          View detailed reports on milk production, vet visits, feeds, and vendors
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reportPeriod">Report Period</Label>
            <Select
              value={reportPeriod}
              onValueChange={(value: "day" | "week" | "month" | "year" | "custom") => setReportPeriod(value)}
            >
              <SelectTrigger id="reportPeriod" className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportPeriod === "custom" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" onClick={() => setExportDialogOpen(true)} className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export All Reports
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <MilkIcon className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Milk Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMilkProduction.toFixed(1)} L</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total production</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Stethoscope className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Vet Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currency} {totalVetCosts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total vet expenses</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Wheat className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Feed Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currency} {totalFeedCosts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total feed expenses</div>
          </CardContent>
        </Card>

        <Card
          className={`bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow ${netIncome < 0 ? "border-2 border-red-500" : ""}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netIncome < 0 ? "text-red-500" : ""}`}>
              {currency} {netIncome.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue - Total Expenses</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milk" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="milk">Milk Production</TabsTrigger>
          <TabsTrigger value="vet">Veterinary</TabsTrigger>
          <TabsTrigger value="feed">Feeds</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="milk">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Milk Production</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCurrentTabReport("milk")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              {monthlyProductionData.every((d) => d.total === 0) ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MilkIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No milk production data available for the selected period</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyProductionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} tickFormatter={(value) => `${value}L`} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)} L`, ""]}
                        contentStyle={{
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                          color: theme === "dark" ? "#f9fafb" : "#111827",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="morning" name="Morning" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="day" name="Day" stackId="a" fill="#eab308" />
                      <Bar dataKey="evening" name="Evening" stackId="a" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Production by Time of Day</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Morning</span>
                      <span className="font-medium">
                        {filteredProductions
                          .filter((p) => p.timeOfDay === "morning")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(1)}{" "}
                        L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Day</span>
                      <span className="font-medium">
                        {filteredProductions
                          .filter((p) => p.timeOfDay === "day")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(1)}{" "}
                        L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evening</span>
                      <span className="font-medium">
                        {filteredProductions
                          .filter((p) => p.timeOfDay === "evening")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(1)}{" "}
                        L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vet">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Veterinary Costs</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCurrentTabReport("vet")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>{/* Vet costs content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Feed Costs</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCurrentTabReport("feed")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>{/* Feed costs content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Vendor Collections</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCurrentTabReport("vendors")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>{/* Vendor collections content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Financial Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCurrentTabReport("summary")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>{/* Financial summary content */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
