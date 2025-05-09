"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Pencil, Trash2, MilkIcon, Search } from "lucide-react"
import { format, parseISO } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BasicSidebar } from "@/components/basic-sidebar"

// Types
interface MilkRecord {
  id: string
  cowId: string
  date: string
  timeOfDay: "morning" | "afternoon" | "evening"
  quantity: number
  notes?: string
}

interface CowData {
  id: string
  tagNumber: string
  name: string
}

interface MilkRecordsTableProps {
  records: MilkRecord[]
  cows: CowData[]
  onEdit: (record: MilkRecord) => void
  onDelete: (record: MilkRecord) => void
}

// Helper component for milk records table
function MilkRecordsTable({ records, cows, onEdit, onDelete }: MilkRecordsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milk Records</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MilkIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>No milk records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cow</TableHead>
                  <TableHead>Time of Day</TableHead>
                  <TableHead>Quantity (L)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records
                  .sort((a, b) => {
                    // Sort by time of day: morning, afternoon, evening
                    const timeOrder = { morning: 1, afternoon: 2, evening: 3 }
                    return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay]
                  })
                  .map((record) => {
                    const cow = cows.find((c) => c.id === record.cowId)
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {cow ? `${cow.name} (${cow.tagNumber})` : "Unknown Cow"}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{record.timeOfDay}</span>
                        </TableCell>
                        <TableCell>{record.quantity.toFixed(1)}</TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => onDelete(record)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProductionPage() {
  const { toast } = useToast()
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([])
  const [cows, setCows] = useState<CowData[]>([])
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false)
  const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MilkRecord | null>(null)
  const [newRecord, setNewRecord] = useState<Partial<MilkRecord>>({
    cowId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    timeOfDay: "morning",
    quantity: 0,
    notes: "",
  })
  const [dateError, setDateError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"))
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon" | "evening" | "all">("all")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load milk records
      const savedRecords = localStorage.getItem("milkRecords")
      if (savedRecords) setMilkRecords(JSON.parse(savedRecords))

      // Load cows
      const savedCows = localStorage.getItem("cows")
      if (savedCows) {
        const parsedCows = JSON.parse(savedCows)
        const simplifiedCows = parsedCows.map((cow: any) => ({
          id: cow.id,
          tagNumber: cow.tagNumber,
          name: cow.name,
        }))
        setCows(simplifiedCows)
      }
    }
  }, [])

  // Validate date to ensure it's not in the future
  const validateDate = (selectedDate: string): boolean => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    const dateToCheck = new Date(selectedDate)

    if (dateToCheck > today) {
      setDateError("You cannot enter data for future dates.")
      return false
    }

    setDateError(null)
    return true
  }

  const handleAddRecord = () => {
    if (!newRecord.cowId || !newRecord.date || !newRecord.quantity) return

    // Validate date
    if (!validateDate(newRecord.date as string)) return

    const record: MilkRecord = {
      id: Date.now().toString(),
      cowId: newRecord.cowId,
      date: newRecord.date,
      timeOfDay: newRecord.timeOfDay as "morning" | "afternoon" | "evening",
      quantity: Number(newRecord.quantity),
      notes: newRecord.notes || "",
    }

    const updatedRecords = [...milkRecords, record]
    setMilkRecords(updatedRecords)
    localStorage.setItem("milkRecords", JSON.stringify(updatedRecords))

    // Reset form but keep the cow ID selected
    const selectedCowId = newRecord.cowId
    setNewRecord({
      cowId: selectedCowId,
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "morning",
      quantity: 0,
      notes: "",
    })
    setIsAddRecordOpen(false)

    const cow = cows.find((c) => c.id === record.cowId)
    toast({
      title: "Record Added",
      description: `Milk record for ${cow?.name || cow?.tagNumber} has been added successfully.`,
    })
  }

  const handleEditRecord = () => {
    if (!selectedRecord || !newRecord.cowId || !newRecord.date || !newRecord.quantity) return

    // Validate date
    if (!validateDate(newRecord.date as string)) return

    const updatedRecord: MilkRecord = {
      ...selectedRecord,
      cowId: newRecord.cowId,
      date: newRecord.date,
      timeOfDay: newRecord.timeOfDay as "morning" | "afternoon" | "evening",
      quantity: Number(newRecord.quantity),
      notes: newRecord.notes || "",
    }

    const updatedRecords = milkRecords.map((r) => (r.id === selectedRecord.id ? updatedRecord : r))
    setMilkRecords(updatedRecords)
    localStorage.setItem("milkRecords", JSON.stringify(updatedRecords))

    setNewRecord({
      cowId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "morning",
      quantity: 0,
      notes: "",
    })
    setSelectedRecord(null)
    setIsEditRecordOpen(false)

    const cow = cows.find((c) => c.id === updatedRecord.cowId)
    toast({
      title: "Record Updated",
      description: `Milk record for ${cow?.name || cow?.tagNumber} has been updated successfully.`,
    })
  }

  const handleDeleteRecord = () => {
    if (!selectedRecord) return

    const updatedRecords = milkRecords.filter((r) => r.id !== selectedRecord.id)
    setMilkRecords(updatedRecords)
    localStorage.setItem("milkRecords", JSON.stringify(updatedRecords))

    const cow = cows.find((c) => c.id === selectedRecord.cowId)
    setSelectedRecord(null)
    setIsDeleteRecordOpen(false)

    toast({
      title: "Record Deleted",
      description: `Milk record for ${cow?.name || cow?.tagNumber} has been deleted successfully.`,
    })
  }

  // Filter records by date, time of day, and search term
  const filteredRecords = milkRecords.filter((record) => {
    const matchesDate = record.date === dateFilter
    const matchesTimeOfDay = activeTab === "all" || record.timeOfDay === activeTab

    // Search by cow name or tag number
    const cow = cows.find((c) => c.id === record.cowId)
    const matchesSearch =
      searchTerm === "" ||
      (cow &&
        (cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cow.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())))

    return matchesDate && matchesTimeOfDay && matchesSearch
  })

  // Calculate total milk production for the filtered records
  const totalMilkProduction = filteredRecords.reduce((total, record) => total + record.quantity, 0)

  // Group records by cow for summary
  const recordsByCow = filteredRecords.reduce(
    (acc, record) => {
      if (!acc[record.cowId]) {
        acc[record.cowId] = {
          cowId: record.cowId,
          totalQuantity: 0,
          records: [],
        }
      }
      acc[record.cowId].totalQuantity += record.quantity
      acc[record.cowId].records.push(record)
      return acc
    },
    {} as Record<string, { cowId: string; totalQuantity: number; records: MilkRecord[] }>,
  )

  // Sort cows by total milk production
  const sortedCowSummary = Object.values(recordsByCow).sort((a, b) => b.totalQuantity - a.totalQuantity)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Always show the sidebar */}
      <BasicSidebar />

      {/* Main content */}
      <div className="ml-64 p-6 flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Milk Production</h1>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">Track and manage your dairy cow milk production</p>
            <Button
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={cows.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Milk Record
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalMilkProduction.toFixed(1)} L</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(parseISO(dateFilter), "MMMM d, yyyy")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Productive Cows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sortedCowSummary.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Cows with milk records today</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Average Per Cow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sortedCowSummary.length > 0 ? (totalMilkProduction / sortedCowSummary.length).toFixed(1) : "0.0"} L
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Average production per cow</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter" className="whitespace-nowrap">
                Date:
              </Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by cow name or tag number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
            <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
              <TabsTrigger value="all">All Times</TabsTrigger>
              <TabsTrigger value="morning">Morning</TabsTrigger>
              <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
              <TabsTrigger value="evening">Evening</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <MilkRecordsTable
                records={filteredRecords}
                cows={cows}
                onEdit={(record) => {
                  setSelectedRecord(record)
                  setNewRecord({
                    cowId: record.cowId,
                    date: record.date,
                    timeOfDay: record.timeOfDay,
                    quantity: record.quantity,
                    notes: record.notes,
                  })
                  setIsEditRecordOpen(true)
                }}
                onDelete={(record) => {
                  setSelectedRecord(record)
                  setIsDeleteRecordOpen(true)
                }}
              />
            </TabsContent>

            <TabsContent value="morning" className="mt-4">
              <MilkRecordsTable
                records={filteredRecords.filter((r) => r.timeOfDay === "morning")}
                cows={cows}
                onEdit={(record) => {
                  setSelectedRecord(record)
                  setNewRecord({
                    cowId: record.cowId,
                    date: record.date,
                    timeOfDay: record.timeOfDay,
                    quantity: record.quantity,
                    notes: record.notes,
                  })
                  setIsEditRecordOpen(true)
                }}
                onDelete={(record) => {
                  setSelectedRecord(record)
                  setIsDeleteRecordOpen(true)
                }}
              />
            </TabsContent>

            <TabsContent value="afternoon" className="mt-4">
              <MilkRecordsTable
                records={filteredRecords.filter((r) => r.timeOfDay === "afternoon")}
                cows={cows}
                onEdit={(record) => {
                  setSelectedRecord(record)
                  setNewRecord({
                    cowId: record.cowId,
                    date: record.date,
                    timeOfDay: record.timeOfDay,
                    quantity: record.quantity,
                    notes: record.notes,
                  })
                  setIsEditRecordOpen(true)
                }}
                onDelete={(record) => {
                  setSelectedRecord(record)
                  setIsDeleteRecordOpen(true)
                }}
              />
            </TabsContent>

            <TabsContent value="evening" className="mt-4">
              <MilkRecordsTable
                records={filteredRecords.filter((r) => r.timeOfDay === "evening")}
                cows={cows}
                onEdit={(record) => {
                  setSelectedRecord(record)
                  setNewRecord({
                    cowId: record.cowId,
                    date: record.date,
                    timeOfDay: record.timeOfDay,
                    quantity: record.quantity,
                    notes: record.notes,
                  })
                  setIsEditRecordOpen(true)
                }}
                onDelete={(record) => {
                  setSelectedRecord(record)
                  setIsDeleteRecordOpen(true)
                }}
              />
            </TabsContent>
          </Tabs>

          {sortedCowSummary.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cow Production Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cow</TableHead>
                        <TableHead>Morning (L)</TableHead>
                        <TableHead>Afternoon (L)</TableHead>
                        <TableHead>Evening (L)</TableHead>
                        <TableHead>Total (L)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCowSummary.map((summary) => {
                        const cow = cows.find((c) => c.id === summary.cowId)
                        const morningMilk = summary.records
                          .filter((r) => r.timeOfDay === "morning")
                          .reduce((sum, r) => sum + r.quantity, 0)
                        const afternoonMilk = summary.records
                          .filter((r) => r.timeOfDay === "afternoon")
                          .reduce((sum, r) => sum + r.quantity, 0)
                        const eveningMilk = summary.records
                          .filter((r) => r.timeOfDay === "evening")
                          .reduce((sum, r) => sum + r.quantity, 0)

                        return (
                          <TableRow key={summary.cowId}>
                            <TableCell className="font-medium">
                              {cow ? `${cow.name} (${cow.tagNumber})` : "Unknown Cow"}
                            </TableCell>
                            <TableCell>{morningMilk.toFixed(1)}</TableCell>
                            <TableCell>{afternoonMilk.toFixed(1)}</TableCell>
                            <TableCell>{eveningMilk.toFixed(1)}</TableCell>
                            <TableCell className="font-bold">{summary.totalQuantity.toFixed(1)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Record Dialog */}
          <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Milk Record</DialogTitle>
                <DialogDescription>Record milk production for a cow.</DialogDescription>
              </DialogHeader>

              {dateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Invalid Date</AlertTitle>
                  <AlertDescription>{dateError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cow" className="text-right">
                    Cow*
                  </Label>
                  <Select
                    value={newRecord.cowId}
                    onValueChange={(value) => setNewRecord({ ...newRecord, cowId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select cow" />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date*
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => {
                      setNewRecord({ ...newRecord, date: e.target.value })
                      validateDate(e.target.value)
                    }}
                    className="col-span-3"
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeOfDay" className="text-right">
                    Time of Day*
                  </Label>
                  <Select
                    value={newRecord.timeOfDay}
                    onValueChange={(value) =>
                      setNewRecord({ ...newRecord, timeOfDay: value as "morning" | "afternoon" | "evening" })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity (L)*
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord({ ...newRecord, quantity: Number.parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRecord}
                  disabled={!newRecord.cowId || !newRecord.date || !newRecord.quantity || !!dateError}
                >
                  Add Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Record Dialog */}
          <Dialog open={isEditRecordOpen} onOpenChange={setIsEditRecordOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Milk Record</DialogTitle>
                <DialogDescription>Update milk production record.</DialogDescription>
              </DialogHeader>

              {dateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Invalid Date</AlertTitle>
                  <AlertDescription>{dateError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cow" className="text-right">
                    Cow*
                  </Label>
                  <Select
                    value={newRecord.cowId}
                    onValueChange={(value) => setNewRecord({ ...newRecord, cowId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select cow" />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">
                    Date*
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => {
                      setNewRecord({ ...newRecord, date: e.target.value })
                      validateDate(e.target.value)
                    }}
                    className="col-span-3"
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-timeOfDay" className="text-right">
                    Time of Day*
                  </Label>
                  <Select
                    value={newRecord.timeOfDay}
                    onValueChange={(value) =>
                      setNewRecord({ ...newRecord, timeOfDay: value as "morning" | "afternoon" | "evening" })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Quantity (L)*
                  </Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.1"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord({ ...newRecord, quantity: Number.parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="edit-notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditRecordOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleEditRecord}
                  disabled={!newRecord.cowId || !newRecord.date || !newRecord.quantity || !!dateError}
                >
                  Update Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Record Dialog */}
          <Dialog open={isDeleteRecordOpen} onOpenChange={setIsDeleteRecordOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Record</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this milk record? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteRecordOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRecord}>
                  Delete Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
