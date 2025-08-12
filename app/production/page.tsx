"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Edit, Trash2, Plus, Search, Calendar, Clock, Milk } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSubscriptionGuard } from "@/lib/subscription"
import { SubscriptionNotice } from "@/components/subscription-notice"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cowOperations, milkProductionOperations } from "@/lib/supabase-operations"
import { isSupabaseConfigured } from "@/lib/supabase"

interface MilkRecord {
  id: string
  cow_id: string
  date: string
  time_of_day: "morning" | "afternoon" | "evening"
  amount: number
  notes?: string
  cows?: {
    id: string
    tag_number: string
    name: string
  }
}

interface CowData {
  id: string
  tag_number: string
  name: string
  breed: string
  date_of_birth: string
  lactation_status:
    | {
        lactating: boolean
        dry: boolean
        inCalf: boolean
      }
    | string
}

export default function ProductionPage() {
  const { toast } = useToast()
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([])
  const [cows, setCows] = useState<CowData[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MilkRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<"all" | "morning" | "afternoon" | "evening">("all")
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [cowId, setCowId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("morning")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")

  const { blocked, amountDue, cowCount } = useSubscriptionGuard()

  const isCowLactating = (cow: CowData): boolean => {
    if (typeof cow.lactation_status === "object" && cow.lactation_status !== null) {
      return (cow.lactation_status as any).lactating === true
    }
    return cow.lactation_status === "lactating"
  }

  // Load data on component mount
  useEffect(() => {
    loadData()

    // Set up real-time subscriptions if Supabase is configured
    if (isSupabaseConfigured()) {
      const unsubscribeCows = cowOperations.subscribe((payload) => {
        console.log("Cows changed:", payload)
        loadCows()
      })

      const unsubscribeMilk = milkProductionOperations.subscribe((payload) => {
        console.log("Milk production changed:", payload)
        loadMilkRecords()
      })

      return () => {
        unsubscribeCows()
        unsubscribeMilk()
      }
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadCows(), loadMilkRecords()])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCows = async () => {
    try {
      const cowsData = await cowOperations.getAll()
      setCows(cowsData)
    } catch (error) {
      console.error("Error loading cows:", error)
    }
  }

  const loadMilkRecords = async () => {
    try {
      const recordsData = await milkProductionOperations.getAll()
      setMilkRecords(recordsData)
    } catch (error) {
      console.error("Error loading milk records:", error)
    }
  }

  const guardBlocked = (): boolean => {
    if (blocked) {
      setBlockedDialogOpen(true)
      return true
    }
    return false
  }

  const handleSaveRecord = async () => {
    if (guardBlocked()) return
    if (!cowId || !date || !timeOfDay || !amount) return

    setSaving(true)
    try {
      const recordData = {
        cow_id: cowId,
        date,
        time_of_day: timeOfDay,
        amount: Number.parseFloat(amount),
        notes: notes || undefined,
      }

      if (editingRecord) {
        await milkProductionOperations.update(editingRecord.id, recordData)
        toast({
          title: "Success",
          description: "Milk record updated successfully.",
        })
      } else {
        await milkProductionOperations.create(recordData)
        toast({
          title: "Success",
          description: "Milk record added successfully.",
        })
      }

      await loadMilkRecords()
      resetForm()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving record:", error)
      toast({
        title: "Error",
        description: "Failed to save milk record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setCowId("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setTimeOfDay("morning")
    setAmount("")
    setNotes("")
    setEditingRecord(null)
  }

  const handleEditRecord = (record: MilkRecord) => {
    setEditingRecord(record)
    setCowId(record.cow_id)
    setDate(record.date)
    setTimeOfDay(record.time_of_day)
    setAmount(record.amount.toString())
    setNotes(record.notes || "")
    setDialogOpen(true)
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    try {
      await milkProductionOperations.delete(recordToDelete)
      await loadMilkRecords()
      toast({
        title: "Success",
        description: "Milk record deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting record:", error)
      toast({
        title: "Error",
        description: "Failed to delete milk record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRecordToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Filters
  const filteredRecords = milkRecords.filter((record) => {
    const cowName = record.cows ? `${record.cows.name} (${record.cows.tag_number})` : "Unknown Cow"
    const matchesSearch = cowName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = selectedDate ? record.date === selectedDate : true
    const matchesTimeOfDay = selectedTimeOfDay === "all" || record.time_of_day === selectedTimeOfDay
    return matchesSearch && matchesDate && matchesTimeOfDay
  })

  const totalMilk = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
  const averagePerRecord = filteredRecords.length > 0 ? totalMilk / filteredRecords.length : 0
  const activeCows = new Set(filteredRecords.map((record) => record.cow_id)).size

  const lactatingCows = cows.filter((cow) => isCowLactating(cow))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Milk Production</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Milk Production</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track daily milk production by cow and time</p>
        <Button
          onClick={() => {
            if (guardBlocked()) return
            resetForm()
            setDialogOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Milk Record
        </Button>
      </div>

      {blocked && <SubscriptionNotice amountDue={amountDue} cowCount={cowCount} />}

      {/* Connection Status */}
      {!isSupabaseConfigured() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-400">
            <strong>Offline Mode:</strong> Using local storage. Connect to Supabase in Settings for real-time sync.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Milk className="mr-2 h-5 w-5 text-emerald-600" />
              Total Milk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMilk.toFixed(1)} L</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{filteredRecords.length} records</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Average per Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averagePerRecord.toFixed(1)} L</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Per milking session</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              Active Cows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCows}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Producing milk</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search by cow name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" />
        <Select
          value={selectedTimeOfDay}
          onValueChange={(value: "all" | "morning" | "afternoon" | "evening") => setSelectedTimeOfDay(value)}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Time of day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Times</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Milk Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Milk className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No milk production records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Cow</th>
                    <th className="text-left py-2">Time of Day</th>
                    <th className="text-left py-2">Amount (L)</th>
                    <th className="text-left py-2">Notes</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-2">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                      <td className="py-2 font-medium">
                        {record.cows ? `${record.cows.name} (${record.cows.tag_number})` : "Unknown Cow"}
                      </td>
                      <td className="py-2">
                        <Badge
                          className={`${
                            record.time_of_day === "morning"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : record.time_of_day === "afternoon"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {record.time_of_day}
                        </Badge>
                      </td>
                      <td className="py-2 font-mono">{record.amount.toFixed(1)}</td>
                      <td className="py-2 text-sm text-gray-600 dark:text-gray-400">{record.notes || "-"}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cow">Cow*</Label>
              <Select value={cowId} onValueChange={setCowId}>
                <SelectTrigger id="cow">
                  <SelectValue placeholder="Select cow" />
                </SelectTrigger>
                <SelectContent>
                  {lactatingCows.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No lactating cows available.</div>
                  ) : (
                    lactatingCows.map((cow) => (
                      <SelectItem key={cow.id} value={cow.id}>
                        {cow.name} ({cow.tag_number})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date*</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeOfDay">Time of Day*</Label>
              <Select value={timeOfDay} onValueChange={(v: "morning" | "afternoon" | "evening") => setTimeOfDay(v)}>
                <SelectTrigger id="timeOfDay">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Liters)*</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in liters"
              />
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
              disabled={!cowId || !date || !timeOfDay || !amount || saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : editingRecord ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this milk production record? This action cannot be undone.
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

      {/* Blocked modal */}
      <Dialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Needed</DialogTitle>
            <DialogDescription>
              You cannot add new milk records because your subscription is inactive.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            Amount due: <strong>KSH {amountDue.toLocaleString()}</strong> for {cowCount} cow{cowCount === 1 ? "" : "s"}{" "}
            (KSH 300 per cow/month).
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockedDialogOpen(false)}>
              Cancel
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/subscription">Continue to Pay</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
