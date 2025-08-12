"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Stethoscope, Edit, Trash2, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react'
import { format, isValid as isValidDate, parseISO } from "date-fns"
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

interface DrugEntry {
  id: string
  name: string
  dosage: string
  duration: string
}

interface VetVisit {
  id: string
  cowId: string
  date: string
  reason: string
  diagnosis: string
  treatment?: string
  drugs?: DrugEntry[]
  followUpDate?: string
  notes?: string
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
  const [treatment, setTreatment] = useState("")
  const [drugs, setDrugs] = useState<DrugEntry[]>([])
  const [followUpDate, setFollowUpDate] = useState("")
  const [notes, setNotes] = useState("")
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
      if (savedVetVisits) {
        // Ensure old records without new fields still work
        const parsed: VetVisit[] = JSON.parse(savedVetVisits)
        setVetVisits(
          parsed.map((v) => ({
            ...v,
            treatment: v.treatment ?? "",
            drugs: v.drugs ?? [],
            followUpDate: v.followUpDate ?? "",
            notes: v.notes ?? "",
          })),
        )
      }
    }
  }, [])

  const resetForm = () => {
    setSelectedCow("")
    setReason("")
    setDiagnosis("")
    setTreatment("")
    setDrugs([])
    setFollowUpDate("")
    setNotes("")
    setCost("")
    setVetName("")
    setVetPhone("")
    setEditingVisit(null)
  }

  const handleSaveVisit = () => {
    if (!selectedCow || !date || !reason || !cost) return

    const numericCost = Number.parseFloat(cost)
    const safeFollowUp = followUpDate && isValidDate(parseISO(followUpDate)) ? followUpDate : ""

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
              treatment,
              drugs,
              followUpDate: safeFollowUp,
              notes,
              cost: isNaN(numericCost) ? 0 : numericCost,
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
        treatment,
        drugs,
        followUpDate: safeFollowUp,
        notes,
        cost: isNaN(numericCost) ? 0 : numericCost,
        vetName,
        vetPhone,
      }

      const updatedVisits = [...vetVisits, visit]
      setVetVisits(updatedVisits)
      localStorage.setItem("vetVisits", JSON.stringify(updatedVisits))
    }

    resetForm()
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
    setTreatment(visit.treatment ?? "")
    setDrugs(visit.drugs ?? [])
    setFollowUpDate(visit.followUpDate ?? "")
    setNotes(visit.notes ?? "")
    setCost(visit.cost.toString())
    setVetName(visit.vetName || "")
    setVetPhone(visit.vetPhone || "")
    setDialogOpen(true)
  }

  // Derived
  const totalCost = vetVisits.reduce((sum, visit) => sum + (visit.cost || 0), 0)

  const reasonCosts = useMemo(() => {
    const r: Record<string, number> = {}
    for (const visit of vetVisits) {
      const key = visit.reason || "Other"
      r[key] = (r[key] || 0) + (visit.cost || 0)
    }
    return r
  }, [vetVisits])

  const pieData = Object.entries(reasonCosts).map(([name, value]) => ({
    name,
    nameKey: name,
    value,
  }))

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  // Checklist completeness for current (open) form
  const checklist = [
    { id: "visit-date", label: "Date of Visit", ok: Boolean(date) },
    { id: "vet-name", label: "Vet Name & Contact", ok: Boolean(vetName || vetPhone) },
    { id: "cow", label: "Cow ID / Name", ok: Boolean(selectedCow) },
    { id: "reason", label: "Reason for Visit", ok: Boolean(reason) },
    { id: "diagnosis", label: "Diagnosis / Findings", ok: Boolean(diagnosis) },
    { id: "treatment", label: "Treatment / Procedure", ok: Boolean(treatment) },
    { id: "drugs", label: "Drugs Used", ok: drugs.length > 0 },
    { id: "cost", label: "Cost", ok: Boolean(cost) },
    { id: "follow-up", label: "Follow-up Date", ok: Boolean(followUpDate) },
    { id: "notes", label: "Notes / Recommendations", ok: Boolean(notes) },
  ]

  // Drug rows handlers
  const addDrug = () => {
    setDrugs((d) => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: "",
        dosage: "",
        duration: "",
      },
    ])
  }
  const removeDrug = (id: string) => setDrugs((d) => d.filter((x) => x.id !== id))
  const updateDrug = (id: string, patch: Partial<DrugEntry>) =>
    setDrugs((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)))

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
        <p className="text-gray-600 dark:text-gray-400">Track veterinary visits, diagnoses, treatments, and costs</p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Stethoscope className="mr-2 h-4 w-4" /> Record Vet Visit
        </Button>
      </div>

      {/* Summary cards */}
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

      {/* Charts and recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md lg:col-span-2">
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

        {/* Sidebar-like Checklist */}
        <Card className="bg-white dark:bg-gray-800 shadow-md lg:sticky lg:top-4 lg:h-fit">
          <CardHeader>
            <CardTitle>Details Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                <span>{item.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="font-medium">Reason:</span> {visit.reason}</p>
                          {visit.diagnosis && <p><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</p>}
                          {visit.treatment && <p><span className="font-medium">Treatment:</span> {visit.treatment}</p>}
                          {visit.drugs && visit.drugs.length > 0 && (
                            <p className="text-xs">
                              <span className="font-medium">Drugs:</span>{" "}
                              {visit.drugs.map((d) => `${d.name} (${d.dosage} for ${d.duration})`).join(", ")}
                            </p>
                          )}
                          {visit.followUpDate && (
                            <p className="text-xs">
                              <span className="font-medium">Follow-up:</span>{" "}
                              {isValidDate(new Date(visit.followUpDate))
                                ? format(new Date(visit.followUpDate), "MMM dd, yyyy")
                                : visit.followUpDate}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Cow</th>
                    <th className="text-left py-2">Reason</th>
                    <th className="text-left py-2">Diagnosis</th>
                    <th className="text-left py-2">Treatment</th>
                    <th className="text-left py-2">Drugs</th>
                    <th className="text-left py-2">Follow-up</th>
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
                      const fu = visit.followUpDate
                        ? isValidDate(new Date(visit.followUpDate))
                          ? format(new Date(visit.followUpDate), "MMM dd, yyyy")
                          : visit.followUpDate
                        : "N/A"
                      return (
                        <tr key={visit.id} className="border-b align-top">
                          <td className="py-2">{format(new Date(visit.date), "MMM dd, yyyy")}</td>
                          <td className="py-2">{cow ? `${cow.tagNumber} - ${cow.name}` : "Unknown"}</td>
                          <td className="py-2">{visit.reason}</td>
                          <td className="py-2">{visit.diagnosis || "N/A"}</td>
                          <td className="py-2">{visit.treatment || "N/A"}</td>
                          <td className="py-2">
                            {visit.drugs && visit.drugs.length > 0
                              ? visit.drugs.map((d) => (
                                  <div key={d.id}>
                                    {d.name} <span className="text-xs text-gray-500">({d.dosage} • {d.duration})</span>
                                  </div>
                                ))
                              : "N/A"}
                          </td>
                          <td className="py-2">{fu}</td>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVisit ? "Edit Vet Visit" : "Record Vet Visit"}</DialogTitle>
          </DialogHeader>
          <div className="grid lg:grid-cols-2 gap-6 py-2">
            <div className="grid gap-4">
              <div className="grid gap-2" id="visit-date">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="grid gap-2" id="cow">
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

              <div className="grid gap-2" id="reason">
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

              <div className="grid gap-2" id="diagnosis">
                <Label htmlFor="diagnosis">Diagnosis / Findings</Label>
                <Textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="What did the vet discover?"
                />
              </div>

              <div className="grid gap-2" id="treatment">
                <Label htmlFor="treatment">Treatment / Procedure</Label>
                <Textarea
                  id="treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="AI performed, surgery, wound dressing, etc."
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2" id="drugs">
                <div className="flex items-center justify-between">
                  <Label>Drugs Used</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addDrug}>
                    <Plus className="h-4 w-4 mr-1" /> Add Drug
                  </Button>
                </div>
                <div className="space-y-3">
                  {drugs.length === 0 && <p className="text-xs text-gray-500">No drugs added</p>}
                  {drugs.map((d) => (
                    <div
                      key={d.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center rounded-md border p-2"
                    >
                      <div className="md:col-span-4">
                        <Label htmlFor={`drug-name-${d.id}`} className="text-xs">Name</Label>
                        <Input
                          id={`drug-name-${d.id}`}
                          value={d.name}
                          onChange={(e) => updateDrug(d.id, { name: e.target.value })}
                          placeholder="e.g., Oxytetracycline"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor={`drug-dose-${d.id}`} className="text-xs">Dosage</Label>
                        <Input
                          id={`drug-dose-${d.id}`}
                          value={d.dosage}
                          onChange={(e) => updateDrug(d.id, { dosage: e.target.value })}
                          placeholder="e.g., 10 ml"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor={`drug-dur-${d.id}`} className="text-xs">Duration</Label>
                        <Input
                          id={`drug-dur-${d.id}`}
                          value={d.duration}
                          onChange={(e) => updateDrug(d.id, { duration: e.target.value })}
                          placeholder="e.g., 5 days"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDrug(d.id)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2" id="follow-up">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2" id="notes">
                <Label htmlFor="notes">Notes / Recommendations</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Farmer instructions (e.g., isolate cow, change feed)"
                />
              </div>

              <div className="grid gap-2" id="vet-name">
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

              <div className="grid gap-2" id="cost">
                <Label htmlFor="cost">Cost (KSH)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Enter cost in KSH"
                  min="0"
                  step="0.01"
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

      {/* Delete confirm */}
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
