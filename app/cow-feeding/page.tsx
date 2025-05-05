"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { sampleCowFeedRecords, calculateTotalFeedNeeded, type CowFeedRecord } from "@/lib/feed-helpers"

export default function CowFeedingPage() {
  const [activeTab, setActiveTab] = useState("daily-feeding")
  const [feedRecords, setFeedRecords] = useState<CowFeedRecord[]>(sampleCowFeedRecords)
  const [newRecord, setNewRecord] = useState<Partial<CowFeedRecord>>({
    cowId: "",
    cowName: "",
    feedType: "",
    quantityKg: 0,
    mineralGrams: 0,
  })

  const feedTotals = calculateTotalFeedNeeded(feedRecords)

  const handleAddRecord = () => {
    if (
      newRecord.cowId &&
      newRecord.cowName &&
      newRecord.feedType &&
      newRecord.quantityKg &&
      newRecord.quantityKg > 0
    ) {
      const record: CowFeedRecord = {
        ...(newRecord as CowFeedRecord),
        date: new Date().toISOString().split("T")[0],
      }
      setFeedRecords([...feedRecords, record])
      setNewRecord({
        cowId: "",
        cowName: "",
        feedType: "",
        quantityKg: 0,
        mineralGrams: 0,
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Cow Feeding Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily-feeding">Daily Feeding</TabsTrigger>
          <TabsTrigger value="feed-inventory">Feed Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="daily-feeding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Daily Feed Consumption</CardTitle>
              <CardDescription>Track how much each cow eats daily</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="cowId">Cow ID</Label>
                  <Input
                    id="cowId"
                    placeholder="Enter cow ID"
                    value={newRecord.cowId}
                    onChange={(e) => setNewRecord({ ...newRecord, cowId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cowName">Cow Name</Label>
                  <Input
                    id="cowName"
                    placeholder="Enter cow name"
                    value={newRecord.cowName}
                    onChange={(e) => setNewRecord({ ...newRecord, cowName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedType">Feed Type</Label>
                  <Select
                    value={newRecord.feedType}
                    onValueChange={(value) => setNewRecord({ ...newRecord, feedType: value })}
                  >
                    <SelectTrigger id="feedType">
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hay">Hay</SelectItem>
                      <SelectItem value="Silage">Silage</SelectItem>
                      <SelectItem value="Concentrate">Concentrate</SelectItem>
                      <SelectItem value="Mixed Feed">Mixed Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityKg">Quantity (kg)</Label>
                  <Input
                    id="quantityKg"
                    type="number"
                    placeholder="Enter quantity in kg"
                    value={newRecord.quantityKg || ""}
                    onChange={(e) => setNewRecord({ ...newRecord, quantityKg: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mineralGrams">Minerals (grams)</Label>
                  <Input
                    id="mineralGrams"
                    type="number"
                    placeholder="Enter minerals in grams"
                    value={newRecord.mineralGrams || ""}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, mineralGrams: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddRecord}>Add Record</Button>
                </div>
              </div>

              <div className="mt-6">
                <DataTable
                  data={feedRecords}
                  columns={[
                    { key: "cowName", title: "Cow Name" },
                    { key: "feedType", title: "Feed Type" },
                    { key: "quantityKg", title: "Quantity (kg)" },
                    { key: "mineralGrams", title: "Minerals (g)" },
                    { key: "date", title: "Date" },
                  ]}
                  searchable
                  searchKeys={["cowName", "feedType"]}
                  pagination
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed-inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feed Inventory</CardTitle>
              <CardDescription>Track feed usage and required purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Feed Type</th>
                      <th className="h-10 px-4 text-left font-medium">Total Quantity (kg)</th>
                      <th className="h-10 px-4 text-left font-medium">Estimated Bags Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedTotals.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4">{item.feedType}</td>
                        <td className="p-4">{item.totalKg.toFixed(1)} kg</td>
                        <td className="p-4">{item.estimatedBags} bags (50kg each)</td>
                      </tr>
                    ))}
                    {feedTotals.length === 0 && (
                      <tr>
                        <td colSpan={3} className="h-24 text-center">
                          No feed records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
