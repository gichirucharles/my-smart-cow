"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Plus, Milk, Clock, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MilkRecord {
  id: string
  cowId: string
  cowName: string
  date: string
  timeOfDay: "morning" | "afternoon" | "evening"
  amount: number
  quality: "excellent" | "good" | "fair" | "poor"
  notes?: string
}

interface Cow {
  id: string
  name: string
  tagNumber: string
}

export default function ProductionPage() {
  const [records, setRecords] = useState<MilkRecord[]>([])
  const [cows, setCows] = useState<Cow[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all")

  // Sample data
  useEffect(() => {
    const sampleCows: Cow[] = [
      { id: "1", name: "Bessie", tagNumber: "COW001" },
      { id: "2", name: "Daisy", tagNumber: "COW002" },
      { id: "3", name: "Molly", tagNumber: "COW003" },
    ]

    const sampleRecords: MilkRecord[] = [
      {
        id: "1",
        cowId: "1",
        cowName: "Bessie (COW001)",
        date: "2024-01-08",
        timeOfDay: "morning",
        amount: 15.5,
        quality: "excellent",
        notes: "Good quality milk",
      },
      {
        id: "2",
        cowId: "2",
        cowName: "Daisy (COW002)",
        date: "2024-01-08",
        timeOfDay: "morning",
        amount: 12.3,
        quality: "good",
      },
      {
        id: "3",
        cowId: "1",
        cowName: "Bessie (COW001)",
        date: "2024-01-08",
        timeOfDay: "evening",
        amount: 14.2,
        quality: "excellent",
      },
    ]

    setCows(sampleCows)
    setRecords(sampleRecords)
  }, [])

  const [newRecord, setNewRecord] = useState<Partial<MilkRecord>>({
    date: selectedDate,
    timeOfDay: "morning",
    amount: 0,
    quality: "good",
  })

  const filteredRecords = records.filter((record) => {
    const dateMatch = record.date === selectedDate
    const timeMatch = selectedTimeFilter === "all" || record.timeOfDay === selectedTimeFilter
    return dateMatch && timeMatch
  })

  const handleAddRecord = () => {
    if (newRecord.cowId && newRecord.amount && newRecord.timeOfDay) {
      const selectedCow = cows.find((cow) => cow.id === newRecord.cowId)
      const record: MilkRecord = {
        id: Date.now().toString(),
        cowId: newRecord.cowId,
        cowName: `${selectedCow?.name} (${selectedCow?.tagNumber})`,
        date: newRecord.date || selectedDate,
        timeOfDay: newRecord.timeOfDay,
        amount: newRecord.amount,
        quality: newRecord.quality || "good",
        notes: newRecord.notes,
      }

      setRecords([...records, record])
      setNewRecord({
        date: selectedDate,
        timeOfDay: "morning",
        amount: 0,
        quality: "good",
      })
      setIsAddDialogOpen(false)
    }
  }

  const getTotalMilk = () => {
    return filteredRecords.reduce((total, record) => total + record.amount, 0)
  }

  const getAverageMilk = () => {
    const total = getTotalMilk()
    return filteredRecords.length > 0 ? total / filteredRecords.length : 0
  }

  const columns = [
    {
      key: "cowName",
      title: "Cow",
      render: (record: MilkRecord) => <div className="font-medium">{record.cowName}</div>,
    },
    {
      key: "timeOfDay",
      title: "Time",
      render: (record: MilkRecord) => (
        <Badge
          variant={
            record.timeOfDay === "morning" ? "default" : record.timeOfDay === "afternoon" ? "secondary" : "outline"
          }
        >
          <Clock className="w-3 h-3 mr-1" />
          {record.timeOfDay}
        </Badge>
      ),
    },
    {
      key: "amount",
      title: "Amount (L)",
      render: (record: MilkRecord) => <div className="font-mono">{record.amount.toFixed(1)}L</div>,
    },
    {
      key: "quality",
      title: "Quality",
      render: (record: MilkRecord) => (
        <Badge
          variant={record.quality === "excellent" ? "default" : record.quality === "good" ? "secondary" : "outline"}
        >
          {record.quality}
        </Badge>
      ),
    },
    {
      key: "notes",
      title: "Notes",
      render: (record: MilkRecord) => <div className="text-sm text-gray-600">{record.notes || "-"}</div>,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milk Production</h1>
          <p className="text-muted-foreground">Track daily milk production by cow and time</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milk Production Record</DialogTitle>
              <DialogDescription>Record milk production for a specific cow and time</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cow">Cow</Label>
                <Select value={newRecord.cowId} onValueChange={(value) => setNewRecord({ ...newRecord, cowId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cow" />
                  </SelectTrigger>
                  <SelectContent>
                    {cows.map((cow) => (
                      <SelectItem key={cow.id} value={cow.id}>
                        {cow.name} ({cow.tagNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Select
                  value={newRecord.timeOfDay}
                  onValueChange={(value: "morning" | "afternoon" | "evening") =>
                    setNewRecord({ ...newRecord, timeOfDay: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (Liters)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  value={newRecord.amount}
                  onChange={(e) => setNewRecord({ ...newRecord, amount: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select
                  value={newRecord.quality}
                  onValueChange={(value: "excellent" | "good" | "fair" | "poor") =>
                    setNewRecord({ ...newRecord, quality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newRecord.notes || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                Add Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milk Today</CardTitle>
            <Milk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalMilk().toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">From {filteredRecords.length} records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Record</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageMilk().toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Per milking session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cows</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cows.length}</div>
            <p className="text-xs text-muted-foreground">Total registered cows</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Records</CardTitle>
          <CardDescription>View and manage milk production records</CardDescription>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time-filter">Time Filter</Label>
              <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredRecords}
            columns={columns}
            searchable={true}
            searchKeys={["cowName", "notes"]}
            pagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}
