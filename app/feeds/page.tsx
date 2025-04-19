"use client"

import { BasicSidebar } from "@/components/basic-sidebar"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Wheat, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
interface Feed {
  id: string
  date: string
  type: string
  quantity: number
  cost: number
  bags: number
  bagWeight: number
}

export default function FeedsPage() {
  const { theme } = useTheme()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [type, setType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [cost, setCost] = useState("")
  const [bags, setBags] = useState("")
  const [bagWeight, setBagWeight] = useState("")
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feedToDelete, setFeedToDelete] = useState<string | null>(null)
  const [customType, setCustomType] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFeeds = localStorage.getItem("feeds")
      if (savedFeeds) {
        // Convert old format to new format if needed
        const parsedFeeds = JSON.parse(savedFeeds)
        const updatedFeeds = parsedFeeds.map((feed: any) => ({
          ...feed,
          bags: feed.bags || Math.ceil(feed.quantity / 50), // Default to quantity/50 if bags not specified
          bagWeight: feed.bagWeight || 50, // Default to 50kg bags
        }))
        setFeeds(updatedFeeds)
        localStorage.setItem("feeds", JSON.stringify(updatedFeeds))
      }
    }
  }, [])

  const handleSaveFeed = () => {
    if (!date || !(type || customType) || !quantity || !cost || !bags || !bagWeight) return

    const feedType = type === "custom" ? customType : type

    if (editingFeed) {
      // Update existing feed
      const updatedFeeds = feeds.map((f) =>
        f.id === editingFeed.id
          ? {
              ...editingFeed,
              date,
              type: feedType,
              quantity: Number.parseFloat(quantity),
              cost: Number.parseFloat(cost),
              bags: Number.parseInt(bags),
              bagWeight: Number.parseFloat(bagWeight),
            }
          : f,
      )
      setFeeds(updatedFeeds)
      localStorage.setItem("feeds", JSON.stringify(updatedFeeds))
    } else {
      // Add new feed
      const feed: Feed = {
        id: Date.now().toString(),
        date,
        type: feedType,
        quantity: Number.parseFloat(quantity),
        cost: Number.parseFloat(cost),
        bags: Number.parseInt(bags),
        bagWeight: Number.parseFloat(bagWeight),
      }

      const updatedFeeds = [...feeds, feed]
      setFeeds(updatedFeeds)
      localStorage.setItem("feeds", JSON.stringify(updatedFeeds))
    }

    setType("")
    setCustomType("")
    setQuantity("")
    setCost("")
    setBags("")
    setBagWeight("")
    setEditingFeed(null)
    setDialogOpen(false)
  }

  const handleDeleteFeed = () => {
    if (!feedToDelete) return

    const updatedFeeds = feeds.filter((f) => f.id !== feedToDelete)
    setFeeds(updatedFeeds)
    localStorage.setItem("feeds", JSON.stringify(updatedFeeds))
    setFeedToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditFeed = (feed: Feed) => {
    setEditingFeed(feed)
    setDate(feed.date)

    // Check if the feed type is in our predefined list
    const predefinedTypes = ["Hay", "Silage", "Dairy Meal", "Minerals", "Concentrates"]
    if (predefinedTypes.includes(feed.type)) {
      setType(feed.type)
    } else {
      setType("custom")
      setCustomType(feed.type)
    }

    setQuantity(feed.quantity.toString())
    setCost(feed.cost.toString())
    setBags(feed.bags?.toString() || "")
    setBagWeight(feed.bagWeight?.toString() || "50")
    setDialogOpen(true)
  }

  // Calculate total cost
  const totalCost = feeds.reduce((sum, feed) => sum + feed.cost, 0)
  const totalQuantity = feeds.reduce((sum, feed) => sum + feed.quantity, 0)
  const totalBags = feeds.reduce((sum, feed) => sum + (feed.bags || 0), 0)

  // Prepare data for the chart
  const feedTypes = Array.from(new Set(feeds.map((feed) => feed.type)))

  const chartData = feedTypes.map((feedType) => {
    const typeFeeds = feeds.filter((feed) => feed.type === feedType)
    const totalCost = typeFeeds.reduce((sum, feed) => sum + feed.cost, 0)
    const totalQuantity = typeFeeds.reduce((sum, feed) => sum + feed.quantity, 0)
    const totalBags = typeFeeds.reduce((sum, feed) => sum + (feed.bags || 0), 0)

    return {
      name: feedType,
      cost: totalCost,
      quantity: totalQuantity,
      bags: totalBags,
    }
  })

  // Calculate bags from quantity if not provided
  const calculateBags = (quantity: string, bagWeight: string) => {
    if (!quantity || !bagWeight || Number(bagWeight) <= 0) return ""
    return Math.ceil(Number(quantity) / Number(bagWeight)).toString()
  }

  // Update bags when quantity or bag weight changes
  useEffect(() => {
    if (quantity && bagWeight) {
      setBags(calculateBags(quantity, bagWeight))
    }
  }, [quantity, bagWeight])

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Always show the sidebar */}
      <BasicSidebar />

      {/* Main content */}
      <div className="ml-64 p-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Feeds Management</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Feed Inventory</h2>
          <p className="text-gray-600">Manage your feed inventory here</p>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Feeds & Concentrates</h1>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">Track feed purchases, quantities, and costs</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              <Wheat className="mr-2 h-4 w-4" /> Add Feed Record
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Feed Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">KSH {totalCost.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{feeds.length} total purchases</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalQuantity.toLocaleString()} kg</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{feedTypes.length} different types</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Bags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalBags.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">across all feed types</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Average Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  KSH {totalQuantity > 0 ? (totalCost / totalQuantity).toFixed(2) : "0.00"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">per kilogram</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle>Feed Costs by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Wheat className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No feed data available</p>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                      <YAxis
                        stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                        tickFormatter={(value) => `KSH ${value}`}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === "cost"
                            ? `KSH ${value.toLocaleString()}`
                            : name === "quantity"
                              ? `${value.toLocaleString()} kg`
                              : `${value.toLocaleString()} bags`,
                          name === "cost" ? "Cost" : name === "quantity" ? "Quantity" : "Bags",
                        ]}
                        contentStyle={{
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                          color: theme === "dark" ? "#f9fafb" : "#111827",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="cost" name="Cost (KSH)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="quantity" name="Quantity (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bags" name="Bags" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feed Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {feeds.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Wheat className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No feed records yet</p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    Add First Feed Record
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Quantity (kg)</th>
                        <th className="text-left py-2">Bags</th>
                        <th className="text-left py-2">Bag Weight (kg)</th>
                        <th className="text-left py-2">Cost (KSH)</th>
                        <th className="text-left py-2">Unit Price (KSH/kg)</th>
                        <th className="text-right py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...feeds]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((feed) => (
                          <tr key={feed.id} className="border-b">
                            <td className="py-2">{format(new Date(feed.date), "MMM dd, yyyy")}</td>
                            <td className="py-2">{feed.type}</td>
                            <td className="py-2">{feed.quantity.toLocaleString()}</td>
                            <td className="py-2">{feed.bags || "-"}</td>
                            <td className="py-2">{feed.bagWeight || "50"}</td>
                            <td className="py-2">{feed.cost.toLocaleString()}</td>
                            <td className="py-2">{(feed.cost / feed.quantity).toFixed(2)}</td>
                            <td className="py-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditFeed(feed)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setFeedToDelete(feed.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFeed ? "Edit Feed Record" : "Add Feed Record"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Feed Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hay">Hay</SelectItem>
                      <SelectItem value="Silage">Silage</SelectItem>
                      <SelectItem value="Dairy Meal">Dairy Meal</SelectItem>
                      <SelectItem value="Minerals">Minerals</SelectItem>
                      <SelectItem value="Concentrates">Concentrates</SelectItem>
                      <SelectItem value="custom">Other (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === "custom" && (
                  <div className="grid gap-2">
                    <Label htmlFor="customType">Custom Feed Type</Label>
                    <Input
                      id="customType"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Enter custom feed type"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity in kilograms"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost (KSH)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="Enter cost in KSH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bagWeight">Bag Weight (kg)</Label>
                    <Input
                      id="bagWeight"
                      type="number"
                      value={bagWeight}
                      onChange={(e) => setBagWeight(e.target.value)}
                      placeholder="Weight per bag in kg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bags">Number of Bags</Label>
                    <Input
                      id="bags"
                      type="number"
                      value={bags}
                      onChange={(e) => setBags(e.target.value)}
                      placeholder="Number of bags"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSaveFeed}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  disabled={!date || !(type || customType) || !quantity || !cost || !bags || !bagWeight}
                >
                  <Save className="mr-2 h-4 w-4" /> {editingFeed ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this feed record? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteFeed}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
