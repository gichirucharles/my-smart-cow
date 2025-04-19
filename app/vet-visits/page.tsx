"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Stethoscope, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"

// Types
interface Cow {
  id: string
  tagNumber: string
  name: string
}

interface VetVisit {
  id: string
  cowId: string
  date: string
  reason: string
  diagnosis: string
  cost: number
  vetName?: string
  vetPhone?: string
}

export default function VetVisitsPage() {
  const { theme } = useTheme()
  const [cows, setCows] = useState<Cow[]>([])
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([])
  const [selectedCow, setSelectedCow] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [reason, setReason] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [cost, setCost] = useState("")
  const [vetName, setVetName] = useState("")
  const [vetPhone, setVetPhone] = useState("")
  const [editingVisit, setEditingVisit] = useState<VetVisit | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCows = localStorage.getItem("cows")
      if (savedCows) setCows(JSON.parse(savedCows))

      const savedVetVisits = localStorage.getItem("vetVisits")
      if (savedVetVisits) setVetVisits(JSON.parse(savedVetVisits))
    }
  }, [])

  const handleSaveVisit = () => {
    if (!selectedCow || !date || !reason || !cost) return

    if (editingVisit) {
      // Update existing visit
      const updatedVisits = vetVisits.map((v) =>
        v.id === editingVisit.id
          ? {
              ...editingVisit,
              cowId: selectedCow,
              date,
              reason,
              diagnosis,
              cost: Number.parseFloat(cost),
              vetName,
              vetPhone,
            }
          : v,
      )
      setVetVisits(updatedVisits)
      localStorage.setItem("vetVisits", JSON.stringify(updatedVisits))
    } else {
      // Add new visit
      const visit: VetVisit = {
        id: Date.now().toString(),
        cowId: selectedCow,
        date,
        reason,
        diagnosis,
        cost: Number.parseFloat(cost),
        vetName,
        vetPhone,
      }

      const updatedVisits = [...vetVisits, visit]
      setVetVisits(updatedVisits)
      localStorage.setItem("vetVisits", JSON.stringify(updatedVisits))
    }

    setSelectedCow("")
    setReason("")
    setDiagnosis("")
    setCost("")
    setVetName("")
    setVetPhone("")
    setEditingVisit(null)
    setDialogOpen(false)
  }

  const handleDeleteVisit = () => {
    if (!visitToDelete) return

    const updatedVisits = vetVisits.filter((v) => v.id !== visitToDelete)
    setVetVisits(updatedVisits)
    localStorage.setItem("vetVisits", JSON.stringify(updatedVisits))
    setVisitToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditVisit = (visit: VetVisit) => {
    setEditingVisit(visit)
    setSelectedCow(visit.cowId)
    setDate(visit.date)
    setReason(visit.reason)
    setDiagnosis(visit.diagnosis)
    setCost(visit.cost.toString())
    setVetName(visit.vetName || "")
    setVetPhone(visit.vetPhone || "")
    setDialogOpen(true)
  }

  // Calculate total cost
  const totalCost = vetVisits.reduce((sum, visit) => sum + visit.cost, 0)

  // Prepare data for the pie chart
  const reasonCounts: Record<string, number> = {}
  vetVisits.forEach((visit) => {
    if (!reasonCounts[visit.reason]) {
      reasonCounts[visit.reason] = 0
    }
    reasonCounts[visit.reason] += visit.cost
  })

  const pieData = Object.entries(reasonCounts).map(([name, value]) => ({
    name,
    nameKey: name,
    value,
  }))

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Veterinary Visits</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track veterinary visits, diagnoses, and costs</p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Stethoscope className="mr-2 h-4 w-4" /> Record Vet Visit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Vet Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSH {totalCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{vetVisits.length} total visits</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle>Cost Breakdown by Reason</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Stethoscope className="mx-auto h-12 w-12 opacity-30 mb-2" />
                <p>No vet visit data available</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart width={400} height={300} data={pieData}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="nameKey"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ nameKey, percent }) => `${nameKey} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `KSH ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f9fafb" : "#111827",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {vetVisits.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No vet visits recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...vetVisits]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map((visit) => {
                    const cow = cows.find((c) => c.id === visit.cowId)
                    return (
                      <div key={visit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown Cow"}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(visit.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="text-amber-600 dark:text-amber-400 font-medium">
                            KSH {visit.cost.toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Reason: {visit.reason}</p>
                          {visit.diagnosis && <p className="text-sm mt-1">Diagnosis: {visit.diagnosis}</p>}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Veterinary Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {vetVisits.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Stethoscope className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No vet visits recorded yet</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Record First Visit
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Cow</th>
                    <th className="text-left py-2">Reason</th>
                    <th className="text-left py-2">Diagnosis</th>
                    <th className="text-left py-2">Vet</th>
                    <th className="text-left py-2">Cost (KSH)</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...vetVisits]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((visit) => {
                      const cow = cows.find((c) => c.id === visit.cowId)
                      return (
                        <tr key={visit.id} className="border-b">
                          <td className="py-2">{format(new Date(visit.date), "MMM dd, yyyy")}</td>
                          <td className="py-2">{cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown"}</td>
                          <td className="py-2">{visit.reason}</td>
                          <td className="py-2">{visit.diagnosis || "N/A"}</td>
                          <td className="py-2">
                            {visit.vetName ? (
                              <div>
                                <div>{visit.vetName}</div>
                                {visit.vetPhone && <div className="text-xs text-gray-500">{visit.vetPhone}</div>}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-2">{visit.cost.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditVisit(visit)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setVisitToDelete(visit.id)
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
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVisit ? "Edit Vet Visit" : "Record Vet Visit"}</DialogTitle>
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
              <Label htmlFor="reason">Reason for Visit</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Artificial Insemination">Artificial Insemination</SelectItem>
                  <SelectItem value="Disease">Disease</SelectItem>
                  <SelectItem value="Injury">Injury</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosis/Notes</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis or additional notes"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vetName">Veterinarian Name</Label>
                <Input
                  id="vetName"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="Enter vet's name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vetPhone">Veterinarian Phone</Label>
                <Input
                  id="vetPhone"
                  value={vetPhone}
                  onChange={(e) => setVetPhone(e.target.value)}
                  placeholder="Enter vet's phone number"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveVisit}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!selectedCow || !date || !reason || !cost}
            >
              <Save className="mr-2 h-4 w-4" /> {editingVisit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vet visit record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVisit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
