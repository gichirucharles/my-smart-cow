"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { Plus, Download, Wheat, Scale } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import * as XLSX from "xlsx"

// Mock data for cow feeding records
const mockFeedingRecords = [
  {
    id: "1",
    cowId: "C001",
    date: "2023-12-01",
    feedType: "Concentrate",
    quantityKg: 5.5,
    mineralsGms: 50,
    cost: 275,
    notes: "Morning feeding",
  },
  {
    id: "2",
    cowId: "C002",
    date: "2023-12-01",
    feedType: "Hay",
    quantityKg: 12.0,
    mineralsGms: 30,
    cost: 120,
    notes: "Evening feeding",
  },
  {
    id: "3",
    cowId: "C001",
    date: "2023-12-02",
    feedType: "Silage",
    quantityKg: 8.0,
    mineralsGms: 40,
    cost: 160,
    notes: "Afternoon feeding",
  },
]

// Mock data for feed inventory
const mockFeedInventory = [
  {
    id: "1",
    feedType: "Concentrate",
    currentStock: 500,
    unit: "kg",
    costPerUnit: 50,
    reorderLevel: 100,
    bagsNeeded: 5,
  },
  {
    id: "2",
    feedType: "Hay",
    currentStock: 200,
    unit: "kg",
    costPerUnit: 10,
    reorderLevel: 50,
    bagsNeeded: 3,
  },
  {
    id: "3",
    feedType: "Silage",
    currentStock: 300,
    unit: "kg",
    costPerUnit: 20,
    reorderLevel: 75,
    bagsNeeded: 2,
  },
]

const feedingColumns = [
  { key: "date", title: "Date" },
  { key: "cowId", title: "Cow ID" },
  { key: "feedType", title: "Feed Type" },
  { key: "quantityKg", title: "Quantity (kg)" },
  { key: "mineralsGms", title: "Minerals (gms)" },
  { key: "cost", title: "Cost (KSH)" },
  { key: "notes", title: "Notes" },
]

const inventoryColumns = [
  { key: "feedType", title: "Feed Type" },
  { key: "currentStock", title: "Current Stock" },
  { key: "unit", title: "Unit" },
  { key: "costPerUnit", title: "Cost/Unit (KSH)" },
  { key: "reorderLevel", title: "Reorder Level" },
  { key: "bagsNeeded", title: "Bags to Purchase" },
]

export default function CowFeedingPage() {
  const [feedingRecords, setFeedingRecords] = useState(mockFeedingRecords)
  const [feedInventory, setFeedInventory] = useState(mockFeedInventory)
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [newRecord, setNewRecord] = useState({
    cowId: "",
    date: "",
    feedType: "",
    quantityKg: "",
    mineralsGms: "",
    cost: "",
    notes: "",
  })

  const handleAddRecord = () => {
    if (newRecord.cowId && newRecord.date && newRecord.feedType && newRecord.quantityKg) {
      const record = {
        id: (feedingRecords.length + 1).toString(),
        cowId: newRecord.cowId,
        date: newRecord.date,
        feedType: newRecord.feedType,
        quantityKg: Number.parseFloat(newRecord.quantityKg),
        mineralsGms: Number.parseFloat(newRecord.mineralsGms) || 0,
        cost: Number.parseFloat(newRecord.cost) || 0,
        notes: newRecord.notes,
      }
      setFeedingRecords([...feedingRecords, record])
      setNewRecord({
        cowId: "",
        date: "",
        feedType: "",
        quantityKg: "",
        mineralsGms: "",
        cost: "",
        notes: "",
      })
      setIsAddingRecord(false)
    }
  }

  const exportFeedingRecords = () => {
    const ws = XLSX.utils.json_to_sheet(feedingRecords)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Feeding Records")
    XLSX.writeFile(wb, "cow-feeding-records.xlsx")
  }

  const exportInventory = () => {
    const ws = XLSX.utils.json_to_sheet(feedInventory)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Feed Inventory")
    XLSX.writeFile(wb, "feed-inventory.xlsx")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Cow Feeding Management</CardTitle>
          <CardDescription>Track daily feeding records and manage feed inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="feeding" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feeding">
                <Wheat className="h-4 w-4 mr-2" />
                Daily Feeding
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Scale className="h-4 w-4 mr-2" />
                Feed Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feeding" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daily Feeding Records</h3>
                <div className="flex gap-2">
                  <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Feeding Record</DialogTitle>
                        <DialogDescription>Add a new daily feeding record for a cow.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cowId">Cow ID</Label>
                          <Input
                            id="cowId"
                            value={newRecord.cowId}
                            onChange={(e) => setNewRecord({ ...newRecord, cowId: e.target.value })}
                            placeholder="e.g., C001"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newRecord.date}
                            onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="feedType">Feed Type</Label>
                          <Select
                            value={newRecord.feedType}
                            onValueChange={(value) => setNewRecord({ ...newRecord, feedType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select feed type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Concentrate">Concentrate</SelectItem>
                              <SelectItem value="Hay">Hay</SelectItem>
                              <SelectItem value="Silage">Silage</SelectItem>
                              <SelectItem value="Grass">Grass</SelectItem>
                              <SelectItem value="Maize">Maize</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="quantityKg">Quantity (kg)</Label>
                          <Input
                            id="quantityKg"
                            type="number"
                            step="0.1"
                            value={newRecord.quantityKg}
                            onChange={(e) => setNewRecord({ ...newRecord, quantityKg: e.target.value })}
                            placeholder="0.0"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="mineralsGms">Minerals (gms)</Label>
                          <Input
                            id="mineralsGms"
                            type="number"
                            value={newRecord.mineralsGms}
                            onChange={(e) => setNewRecord({ ...newRecord, mineralsGms: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cost">Cost (KSH)</Label>
                          <Input
                            id="cost"
                            type="number"
                            step="0.01"
                            value={newRecord.cost}
                            onChange={(e) => setNewRecord({ ...newRecord, cost: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Input
                            id="notes"
                            value={newRecord.notes}
                            onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                            placeholder="Optional notes"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingRecord(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddRecord}>Add Record</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={exportFeedingRecords} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <DataTable
                data={feedingRecords}
                columns={feedingColumns}
                searchable={true}
                searchKeys={["cowId", "feedType", "date"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Feed Inventory & Purchase Planning</h3>
                <Button onClick={exportInventory} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Inventory
                </Button>
              </div>

              <DataTable
                data={feedInventory}
                columns={inventoryColumns}
                searchable={true}
                searchKeys={["feedType"]}
                pagination={true}
                pageSize={10}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchase Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {feedInventory.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{item.feedType}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current: {item.currentStock} {item.unit}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reorder at: {item.reorderLevel} {item.unit}
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-blue-600">{item.bagsNeeded} bags needed</span>
                          <p className="text-sm">
                            Est. Cost: KSH {(item.bagsNeeded * item.costPerUnit * 50).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
