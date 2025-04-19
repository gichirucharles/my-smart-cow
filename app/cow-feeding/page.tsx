"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Edit, Trash2, Utensils, MilkIcon as Cow, DollarSign, Info } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types
interface CowData {
  id: string
  tagNumber: string
  name: string
  expectedDeliveryDate: string
  aiDates: string[]
}

interface FeedItem {
  id: string
  name: string
  unitPrice: number
  unit: string
}

interface FeedingRecord {
  id: string
  cowId: string
  date: string
  feedItems: {
    feedItemId: string
    amount: number
  }[]
  notes?: string
}

interface Feed {
  id: string
  type: string
  quantity: number
  cost: number
  bags?: number
  bagWeight?: number
}

export default function CowFeedingPage() {
  const { user } = useAuth()
  const [cows, setCows] = useState<CowData[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [selectedCow, setSelectedCow] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedFeedItems, setSelectedFeedItems] = useState<{ feedItemId: string; amount: number }[]>([])
  const [notes, setNotes] = useState("")
  const [editingRecord, setEditingRecord] = useState<FeedingRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [currency, setCurrency] = useState("KSH")
  const [addFeedItemDialogOpen, setAddFeedItemDialogOpen] = useState(false)
  const [newFeedItemName, setNewFeedItemName] = useState("")
  const [newFeedItemUnitPrice, setNewFeedItemUnitPrice] = useState("")
  const [newFeedItemUnit, setNewFeedItemUnit] = useState("kg")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCows = localStorage.getItem("cows")
      if (savedCows) setCows(JSON.parse(savedCows))

      // Check if we have the new format of feeding records
      const savedFeedingRecords = localStorage.getItem("cowFeedingRecords")
      if (savedFeedingRecords) {
        try {
          const parsedRecords = JSON.parse(savedFeedingRecords)

          // Check if records are in the new format (with feedItems array)
          if (parsedRecords.length > 0 && "feedItems" in parsedRecords[0]) {
            setFeedingRecords(parsedRecords)
          } else {
            // Convert old format to new format
            const convertedRecords = parsedRecords.map((record: any) => {
              const feedItemsArray = []

              // Add feed item if it exists
              if (record.feedType && record.feedAmount) {
                const feedItemId = `feed-${record.feedType.toLowerCase().replace(/\s+/g, "-")}`
                feedItemsArray.push({
                  feedItemId,
                  amount: record.feedAmount,
                })
              }

              // Add mineral item if it exists
              if (record.mineralAmount && record.mineralAmount > 0) {
                feedItemsArray.push({
                  feedItemId: "feed-minerals",
                  amount: record.mineralAmount,
                })
              }

              return {
                id: record.id,
                cowId: record.cowId,
                date: record.date,
                feedItems: feedItemsArray,
                notes: record.notes,
              }
            })

            setFeedingRecords(convertedRecords)
            localStorage.setItem("cowFeedingRecords", JSON.stringify(convertedRecords))
          }
        } catch (error) {
          console.error("Error parsing feeding records:", error)
          setFeedingRecords([])
        }
      }

      // Load feeds data to get unit prices
      const savedFeeds = localStorage.getItem("feeds")
      if (savedFeeds) {
        const parsedFeeds = JSON.parse(savedFeeds)
        setFeeds(parsedFeeds)
      }

      // Load or create feed items
      const savedFeedItems = localStorage.getItem("feedItems")
      if (savedFeedItems) {
        setFeedItems(JSON.parse(savedFeedItems))
      } else {
        // Create default feed items if none exist
        const defaultFeedItems = [
          { id: "feed-dairy-meal", name: "Dairy Meal", unitPrice: 37.86, unit: "kg" },
          { id: "feed-hay", name: "Hay", unitPrice: 15.5, unit: "kg" },
          { id: "feed-silage", name: "Silage", unitPrice: 8.75, unit: "kg" },
          { id: "feed-minerals", name: "Minerals", unitPrice: 0.45, unit: "g" },
          { id: "feed-concentrates", name: "Concentrates", unitPrice: 42.0, unit: "kg" },
        ]
        setFeedItems(defaultFeedItems)
        localStorage.setItem("feedItems", JSON.stringify(defaultFeedItems))
      }

      // Set currency based on user's country
      if (user?.country) {
        if (user.country === "Kenya") setCurrency("KSH")
        else if (user.country === "Uganda") setCurrency("UGX")
        else if (user.country === "Tanzania") setCurrency("TZS")
        else if (user.country === "United States") setCurrency("USD")
        else if (user.country === "United Kingdom") setCurrency("GBP")
        else setCurrency("KSH") // Default
      }
    }
  }, [user])

  // Update feed item prices from feeds data
  useEffect(() => {
    if (feeds.length > 0 && feedItems.length > 0) {
      const updatedFeedItems = [...feedItems]
      let hasUpdates = false

      // Update prices based on feeds data
      feeds.forEach((feed) => {
        const feedItemIndex = updatedFeedItems.findIndex((item) => item.name.toLowerCase() === feed.type.toLowerCase())

        if (feedItemIndex >= 0) {
          // Calculate unit price from feed data
          const unitPrice = feed.cost / feed.quantity

          // Only update if different
          if (updatedFeedItems[feedItemIndex].unitPrice !== unitPrice) {
            updatedFeedItems[feedItemIndex].unitPrice = unitPrice
            hasUpdates = true
          }
        }
      })

      // Save updated feed items if there were changes
      if (hasUpdates) {
        setFeedItems(updatedFeedItems)
        localStorage.setItem("feedItems", JSON.stringify(updatedFeedItems))
      }
    }
  }, [feeds, feedItems])

  const handleSaveRecord = () => {
    if (!selectedCow || !date || selectedFeedItems.length === 0) return

    if (editingRecord) {
      // Update existing record
      const updatedRecords = feedingRecords.map((r) =>
        r.id === editingRecord.id
          ? {
              ...editingRecord,
              cowId: selectedCow,
              date,
              feedItems: selectedFeedItems,
              notes,
            }
          : r,
      )
      setFeedingRecords(updatedRecords)
      localStorage.setItem("cowFeedingRecords", JSON.stringify(updatedRecords))
    } else {
      // Add new record
      const record: FeedingRecord = {
        id: Date.now().toString(),
        cowId: selectedCow,
        date,
        feedItems: selectedFeedItems,
        notes,
      }

      const updatedRecords = [...feedingRecords, record]
      setFeedingRecords(updatedRecords)
      localStorage.setItem("cowFeedingRecords", JSON.stringify(updatedRecords))
    }

    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setSelectedCow("")
    setSelectedFeedItems([])
    setNotes("")
    setEditingRecord(null)
  }

  const handleDeleteRecord = () => {
    if (!recordToDelete) return

    const updatedRecords = feedingRecords.filter((r) => r.id !== recordToDelete)
    setFeedingRecords(updatedRecords)
    localStorage.setItem("cowFeedingRecords", JSON.stringify(updatedRecords))
    setRecordToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditRecord = (record: FeedingRecord) => {
    setEditingRecord(record)
    setSelectedCow(record.cowId)
    setDate(record.date)
    setSelectedFeedItems(record.feedItems)
    setNotes(record.notes || "")
    setDialogOpen(true)
  }

  const handleAddFeedItem = () => {
    if (!newFeedItemName || !newFeedItemUnitPrice) return

    const newItem: FeedItem = {
      id: `feed-${newFeedItemName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: newFeedItemName,
      unitPrice: Number.parseFloat(newFeedItemUnitPrice),
      unit: newFeedItemUnit,
    }

    const updatedFeedItems = [...feedItems, newItem]
    setFeedItems(updatedFeedItems)
    localStorage.setItem("feedItems", JSON.stringify(updatedFeedItems))

    // Reset form
    setNewFeedItemName("")
    setNewFeedItemUnitPrice("")
    setNewFeedItemUnit("kg")
    setAddFeedItemDialogOpen(false)
  }

  const handleAddFeedItemToRecord = (feedItemId: string, amount: number) => {
    const existingItemIndex = selectedFeedItems.findIndex((item) => item.feedItemId === feedItemId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...selectedFeedItems]
      updatedItems[existingItemIndex].amount = amount
      setSelectedFeedItems(updatedItems)
    } else {
      // Add new item
      setSelectedFeedItems([...selectedFeedItems, { feedItemId, amount }])
    }
  }

  const handleRemoveFeedItemFromRecord = (feedItemId: string) => {
    setSelectedFeedItems(selectedFeedItems.filter((item) => item.feedItemId !== feedItemId))
  }

  // Calculate total feed consumption and costs
  const calculateTotals = () => {
    let totalFeedKg = 0
    let totalMineralG = 0
    let totalCost = 0

    feedingRecords.forEach((record) => {
      record.feedItems.forEach((item) => {
        const feedItem = feedItems.find((f) => f.id === item.feedItemId)
        if (feedItem) {
          if (feedItem.unit === "kg") {
            totalFeedKg += item.amount
          } else if (feedItem.unit === "g") {
            totalMineralG += item.amount
          }
          totalCost += item.amount * feedItem.unitPrice
        }
      })
    })

    return { totalFeedKg, totalMineralG, totalCost }
  }

  const { totalFeedKg, totalMineralG, totalCost } = calculateTotals()

  // Get today's records
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const todayRecords = feedingRecords.filter((r) => r.date === todayStr)

  // Calculate costs per cow
  const cowFeedingCosts = cows
    .map((cow) => {
      const cowRecords = feedingRecords.filter((r) => r.cowId === cow.id)
      let totalCost = 0
      let feedKg = 0
      let mineralG = 0

      cowRecords.forEach((record) => {
        record.feedItems.forEach((item) => {
          const feedItem = feedItems.find((f) => f.id === item.feedItemId)
          if (feedItem) {
            if (feedItem.unit === "kg") {
              feedKg += item.amount
            } else if (feedItem.unit === "g") {
              mineralG += item.amount
            }
            totalCost += item.amount * feedItem.unitPrice
          }
        })
      })

      return {
        cow,
        feedKg,
        mineralG,
        totalCost,
        records: cowRecords,
      }
    })
    .filter((item) => item.records.length > 0)

  // Calculate feed item totals
  const feedItemTotals = feedItems
    .map((item) => {
      let totalAmount = 0
      let totalCost = 0

      feedingRecords.forEach((record) => {
        const feedItem = record.feedItems.find((fi) => fi.feedItemId === item.id)
        if (feedItem) {
          totalAmount += feedItem.amount
          totalCost += feedItem.amount * item.unitPrice
        }
      })

      return {
        ...item,
        totalAmount,
        totalCost,
      }
    })
    .filter((item) => item.totalAmount > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Cow Feeding Records</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track daily feed and mineral consumption for each cow</p>
        <div className="flex gap-2">
          <Button onClick={() => setAddFeedItemDialogOpen(true)} variant="outline">
            <DollarSign className="mr-2 h-4 w-4" /> Add Feed Item
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setDialogOpen(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            <Utensils className="mr-2 h-4 w-4" /> Add Feeding Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Feed Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFeedKg.toFixed(1)} kg</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{feedingRecords.length} feeding records</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Mineral Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMineralG.toFixed(1)} g</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {
                feedingRecords.filter((r) =>
                  r.feedItems.some((fi) => {
                    const item = feedItems.find((f) => f.id === fi.feedItemId)
                    return item?.unit === "g"
                  }),
                ).length
              }{" "}
              records with minerals
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Today's Feeding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayRecords.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {todayRecords
                .reduce((sum, r) => {
                  let feedKg = 0
                  r.feedItems.forEach((item) => {
                    const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                    if (feedItem && feedItem.unit === "kg") {
                      feedKg += item.amount
                    }
                  })
                  return sum + feedKg
                }, 0)
                .toFixed(1)}{" "}
              kg of feed today
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-emerald-600" />
              Total Feed Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currency} {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Based on unit prices of each feed item</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="by-cow">By Cow</TabsTrigger>
          <TabsTrigger value="costs">Costs Per Cow</TabsTrigger>
          <TabsTrigger value="items">Feed Items</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FeedingRecordsTable
            records={feedingRecords}
            cows={cows}
            feedItems={feedItems}
            currency={currency}
            onEdit={handleEditRecord}
            onDelete={(id) => {
              setRecordToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="today">
          <FeedingRecordsTable
            records={todayRecords}
            cows={cows}
            feedItems={feedItems}
            currency={currency}
            onEdit={handleEditRecord}
            onDelete={(id) => {
              setRecordToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="by-cow">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Records by Cow</CardTitle>
            </CardHeader>
            <CardContent>
              {cows.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Cow className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No cows available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cows.map((cow) => {
                    const cowRecords = feedingRecords.filter((r) => r.cowId === cow.id)
                    if (cowRecords.length === 0) return null

                    // Calculate totals for this cow
                    let totalFeedKg = 0
                    let totalMineralG = 0
                    let totalCost = 0

                    cowRecords.forEach((record) => {
                      record.feedItems.forEach((item) => {
                        const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                        if (feedItem) {
                          if (feedItem.unit === "kg") {
                            totalFeedKg += item.amount
                          } else if (feedItem.unit === "g") {
                            totalMineralG += item.amount
                          }
                          totalCost += item.amount * feedItem.unitPrice
                        }
                      })
                    })

                    // Calculate average daily feed
                    const uniqueDates = new Set(cowRecords.map((r) => r.date))
                    const avgDailyFeed = totalFeedKg / uniqueDates.size

                    return (
                      <div key={cow.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-2">
                          {cow.tagNumber} - {cow.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Feed</p>
                            <p className="font-medium">{totalFeedKg.toFixed(1)} kg</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Minerals</p>
                            <p className="font-medium">{totalMineralG.toFixed(1)} g</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Daily Feed</p>
                            <p className="font-medium">{avgDailyFeed.toFixed(1)} kg</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
                            <p className="font-medium">
                              {currency} {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Date</th>
                                <th className="text-left py-2">Feed Items</th>
                                <th className="text-left py-2">Cost</th>
                                <th className="text-right py-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cowRecords
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((record) => {
                                  // Calculate total cost for this record
                                  let recordCost = 0
                                  record.feedItems.forEach((item) => {
                                    const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                                    if (feedItem) {
                                      recordCost += item.amount * feedItem.unitPrice
                                    }
                                  })

                                  return (
                                    <tr key={record.id} className="border-b">
                                      <td className="py-2">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                                      <td className="py-2">
                                        <div className="space-y-1">
                                          {record.feedItems.map((item) => {
                                            const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                                            return feedItem ? (
                                              <div key={item.feedItemId} className="text-sm">
                                                {feedItem.name}: {item.amount} {feedItem.unit}
                                                <span className="text-gray-500 ml-2">
                                                  ({currency} {(item.amount * feedItem.unitPrice).toFixed(2)})
                                                </span>
                                              </div>
                                            ) : null
                                          })}
                                        </div>
                                      </td>
                                      <td className="py-2">
                                        {currency} {recordCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="py-2 text-right">
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="ghost" size="icon" onClick={() => handleEditRecord(record)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              setRecordToDelete(record.id)
                                              setDeleteDialogOpen(true)
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Costs by Cow</CardTitle>
            </CardHeader>
            <CardContent>
              {cowFeedingCosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DollarSign className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No feeding cost data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cow</th>
                        <th className="text-left py-2">Tag Number</th>
                        <th className="text-left py-2">Feed (kg)</th>
                        <th className="text-left py-2">Minerals (g)</th>
                        <th className="text-left py-2">Total Cost</th>
                        <th className="text-left py-2">Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cowFeedingCosts
                        .sort((a, b) => b.totalCost - a.totalCost)
                        .map(({ cow, feedKg, mineralG, totalCost, records }) => (
                          <tr key={cow.id} className="border-b">
                            <td className="py-2 font-medium">{cow.name}</td>
                            <td className="py-2">{cow.tagNumber}</td>
                            <td className="py-2">{feedKg.toFixed(1)}</td>
                            <td className="py-2">{mineralG.toFixed(1)}</td>
                            <td className="py-2 font-medium">
                              {currency} {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2">{records.length}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Feed Items Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {feedItemTotals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Utensils className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No feed items data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Feed Item</th>
                        <th className="text-left py-2">Unit Price</th>
                        <th className="text-left py-2">Total Amount</th>
                        <th className="text-left py-2">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedItemTotals
                        .sort((a, b) => b.totalCost - a.totalCost)
                        .map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2">
                              {currency} {item.unitPrice.toFixed(2)} per {item.unit}
                            </td>
                            <td className="py-2">
                              {item.totalAmount.toFixed(1)} {item.unit}
                            </td>
                            <td className="py-2 font-medium">
                              {currency} {item.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Feeding Record" : "Add Feeding Record"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cow">Cow</Label>
              <Select value={selectedCow} onValueChange={setSelectedCow}>
                <SelectTrigger id="cow">
                  <SelectValue placeholder="Select cow" />
                </SelectTrigger>
                <SelectContent>
                  {cows.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.tagNumber} - {cow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Feed Items</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Add feed items with their amounts. The cost will be calculated based on the unit price.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                {feedItems.map((feedItem) => {
                  const selectedItem = selectedFeedItems.find((item) => item.feedItemId === feedItem.id)
                  const amount = selectedItem ? selectedItem.amount : 0

                  return (
                    <div key={feedItem.id} className="flex items-center gap-3 p-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{feedItem.name}</p>
                        <p className="text-sm text-gray-500">
                          {currency} {feedItem.unitPrice.toFixed(2)} per {feedItem.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={amount || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value) || 0
                            if (value > 0) {
                              handleAddFeedItemToRecord(feedItem.id, value)
                            } else {
                              handleRemoveFeedItemFromRecord(feedItem.id)
                            }
                          }}
                          className="w-24"
                          placeholder={`Amount in ${feedItem.unit}`}
                        />
                        <span className="text-sm">{feedItem.unit}</span>
                        {amount > 0 && (
                          <div className="text-sm">
                            = {currency} {(amount * feedItem.unitPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedFeedItems.length > 0 && (
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                  <p className="font-medium">
                    Total Cost: {currency}{" "}
                    {selectedFeedItems
                      .reduce((sum, item) => {
                        const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                        return sum + (feedItem ? item.amount * feedItem.unitPrice : 0)
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveRecord}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!selectedCow || !date || selectedFeedItems.length === 0}
            >
              <Save className="mr-2 h-4 w-4" /> {editingRecord ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feeding record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRecord}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addFeedItemDialogOpen} onOpenChange={setAddFeedItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feed Item</DialogTitle>
            <DialogDescription>Add a new feed item with its unit price to track in feeding records.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feedItemName">Feed Item Name</Label>
              <Input
                id="feedItemName"
                value={newFeedItemName}
                onChange={(e) => setNewFeedItemName(e.target.value)}
                placeholder="e.g., Dairy Meal, Hay, Minerals"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Unit Price ({currency})</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newFeedItemUnitPrice}
                  onChange={(e) => setNewFeedItemUnitPrice(e.target.value)}
                  placeholder="Price per unit"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={newFeedItemUnit} onValueChange={setNewFeedItemUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg (Kilogram)</SelectItem>
                    <SelectItem value="g">g (Gram)</SelectItem>
                    <SelectItem value="l">l (Liter)</SelectItem>
                    <SelectItem value="ml">ml (Milliliter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFeedItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddFeedItem}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!newFeedItemName || !newFeedItemUnitPrice}
            >
              Add Feed Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for feeding records table
function FeedingRecordsTable({
  records,
  cows,
  feedItems,
  currency,
  onEdit,
  onDelete,
}: {
  records: FeedingRecord[]
  cows: CowData[]
  feedItems: FeedItem[]
  currency: string
  onEdit: (record: FeedingRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feeding Records</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Utensils className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>No feeding records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Cow</th>
                  <th className="text-left py-2">Feed Items</th>
                  <th className="text-left py-2">Total Cost</th>
                  <th className="text-left py-2">Notes</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => {
                    const cow = cows.find((c) => c.id === record.cowId)

                    // Calculate total cost for this record
                    let totalCost = 0
                    record.feedItems.forEach((item) => {
                      const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                      if (feedItem) {
                        totalCost += item.amount * feedItem.unitPrice
                      }
                    })

                    return (
                      <tr key={record.id} className="border-b">
                        <td className="py-2">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                        <td className="py-2">{cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown"}</td>
                        <td className="py-2">
                          <div className="space-y-1">
                            {record.feedItems.map((item) => {
                              const feedItem = feedItems.find((f) => f.id === item.feedItemId)
                              return feedItem ? (
                                <div key={item.feedItemId} className="text-sm">
                                  {feedItem.name}: {item.amount} {feedItem.unit}
                                  <span className="text-gray-500 ml-2">
                                    ({currency} {(item.amount * feedItem.unitPrice).toFixed(2)})
                                  </span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </td>
                        <td className="py-2">
                          {currency} {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2">{record.notes || "-"}</td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
