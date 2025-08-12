"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Trash2, Download, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSubscriptionGuard } from "@/lib/subscription"
import { SubscriptionNotice } from "@/components/subscription-notice"

// Heavy libs for exports
import jsPDF from "jspdf"
import JSZip from "jszip"

type Cow = {
  id: string
  tagNumber: string
  name: string
  breed: string
  dateOfBirth: string
  motherId?: string
  expectedDeliveryDate?: string
  aiDates?: string[]
  status: "active" | "pregnant" | "dry" | "sold" | "deceased"
}

type MilkProduction = {
  id: string
  cowId: string
  date: string
  timeOfDay: "morning" | "day" | "evening"
  amount: number
}

type AIRecord = {
  id: string
  cowId: string
  date: string
  bullName?: string
  semenBatch?: string
  technicianName?: string
  cost?: number
}

export default function CowsPage() {
  const { toast } = useToast()
  const subscriptionState = useSubscriptionGuard()

  const [cows, setCows] = useState<Cow[]>([])
  const [milkProductions, setMilkProductions] = useState<MilkProduction[]>([])
  const [aiRecords, setAIRecords] = useState<AIRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCow, setEditingCow] = useState<Cow | null>(null)
  const [isGeneratingPack, setIsGeneratingPack] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    tagNumber: "",
    name: "",
    breed: "",
    dateOfBirth: "",
    motherId: "",
    expectedDeliveryDate: "",
    status: "active" as Cow["status"],
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsLoading(true)
    setTimeout(() => {
      try {
        setCows(JSON.parse(localStorage.getItem("cows") || "[]"))
        setMilkProductions(JSON.parse(localStorage.getItem("milkProductions") || "[]"))
        setAIRecords(JSON.parse(localStorage.getItem("aiRecords") || "[]"))
      } catch (error) {
        console.error("Failed to load cows data:", error)
      }
      setIsLoading(false)
    }, 100)
  }, [])

  const resetForm = () => {
    setFormData({
      tagNumber: "",
      name: "",
      breed: "",
      dateOfBirth: "",
      motherId: "",
      expectedDeliveryDate: "",
      status: "active",
    })
    setEditingCow(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (subscriptionState.blocked) {
      toast({
        title: "Subscription Required",
        description: "Your trial has ended. Please subscribe to continue adding cows.",
        variant: "destructive",
      })
      return
    }

    if (!formData.tagNumber || !formData.name || !formData.breed || !formData.dateOfBirth) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const cowData: Cow = {
      id: editingCow?.id || Date.now().toString(),
      tagNumber: formData.tagNumber,
      name: formData.name,
      breed: formData.breed,
      dateOfBirth: formData.dateOfBirth,
      motherId: formData.motherId || undefined,
      expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      status: formData.status,
    }

    let updatedCows: Cow[]
    if (editingCow) {
      updatedCows = cows.map((cow) => (cow.id === editingCow.id ? cowData : cow))
      toast({
        title: "Success",
        description: "Cow updated successfully",
      })
    } else {
      updatedCows = [...cows, cowData]
      toast({
        title: "Success",
        description: "Cow added successfully",
      })
    }

    setCows(updatedCows)
    localStorage.setItem("cows", JSON.stringify(updatedCows))
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (cow: Cow) => {
    setEditingCow(cow)
    setFormData({
      tagNumber: cow.tagNumber,
      name: cow.name,
      breed: cow.breed,
      dateOfBirth: cow.dateOfBirth,
      motherId: cow.motherId || "",
      expectedDeliveryDate: cow.expectedDeliveryDate || "",
      status: cow.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (cowId: string) => {
    const updatedCows = cows.filter((cow) => cow.id !== cowId)
    setCows(updatedCows)
    localStorage.setItem("cows", JSON.stringify(updatedCows))
    toast({
      title: "Success",
      description: "Cow deleted successfully",
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birth = new Date(dateOfBirth)
      if (isNaN(birth.getTime())) return "Unknown"

      const today = new Date()
      const diffTime = Math.abs(today.getTime() - birth.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 30) return `${diffDays} days`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
      return `${Math.floor(diffDays / 365)} years`
    } catch {
      return "Unknown"
    }
  }

  const generateCowReport = (cow: Cow) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(16)
    doc.text("Complete Cow Record", 14, 20)

    // Basic Info
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Basic Information", 14, 35)
    doc.setFont(undefined, "normal")
    doc.text(`Tag Number: ${cow.tagNumber}`, 16, 45)
    doc.text(`Name: ${cow.name}`, 16, 52)
    doc.text(`Breed: ${cow.breed}`, 16, 59)
    doc.text(`Date of Birth: ${cow.dateOfBirth}`, 16, 66)
    doc.text(`Age: ${calculateAge(cow.dateOfBirth)}`, 16, 73)
    doc.text(`Status: ${cow.status}`, 16, 80)

    // Lineage
    let y = 95
    doc.setFont(undefined, "bold")
    doc.text("Lineage", 14, y)
    doc.setFont(undefined, "normal")
    y += 10

    if (cow.motherId) {
      const mother = cows.find((c) => c.id === cow.motherId)
      if (mother) {
        doc.text(`Mother: ${mother.tagNumber} - ${mother.name}`, 16, y)
        y += 7

        // Grandmother
        if (mother.motherId) {
          const grandmother = cows.find((c) => c.id === mother.motherId)
          if (grandmother) {
            doc.text(`Grandmother: ${grandmother.tagNumber} - ${grandmother.name}`, 16, y)
            y += 7
          }
        }
      }
    } else {
      doc.text("No lineage records available", 16, y)
      y += 7
    }

    // Milk Production Summary
    y += 10
    doc.setFont(undefined, "bold")
    doc.text("Milk Production Summary", 14, y)
    doc.setFont(undefined, "normal")
    y += 10

    const cowMilk = milkProductions.filter((m) => m.cowId === cow.id)
    if (cowMilk.length > 0) {
      const totalMilk = cowMilk.reduce((sum, m) => sum + m.amount, 0)
      const avgDaily = totalMilk / cowMilk.length
      const lastProduction = cowMilk.sort((a, b) => b.date.localeCompare(a.date))[0]

      doc.text(`Total Records: ${cowMilk.length}`, 16, y)
      y += 7
      doc.text(`Total Milk: ${totalMilk.toFixed(1)} L`, 16, y)
      y += 7
      doc.text(`Average Daily: ${avgDaily.toFixed(1)} L`, 16, y)
      y += 7
      doc.text(`Last Production: ${lastProduction.date} - ${lastProduction.amount}L`, 16, y)
      y += 7
    } else {
      doc.text("No milk production records", 16, y)
      y += 7
    }

    // AI/Breeding Records
    y += 10
    doc.setFont(undefined, "bold")
    doc.text("AI/Breeding Records", 14, y)
    doc.setFont(undefined, "normal")
    y += 10

    const cowAI = aiRecords.filter((ai) => ai.cowId === cow.id)
    if (cowAI.length > 0) {
      cowAI.forEach((ai) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(`Date: ${ai.date}`, 16, y)
        y += 7
        if (ai.bullName) {
          doc.text(`Bull: ${ai.bullName}`, 18, y)
          y += 7
        }
        if (ai.semenBatch) {
          doc.text(`Semen Batch: ${ai.semenBatch}`, 18, y)
          y += 7
        }
        if (ai.technicianName) {
          doc.text(`Technician: ${ai.technicianName}`, 18, y)
          y += 7
        }
        y += 3
      })
    } else {
      doc.text("No AI/breeding records", 16, y)
    }

    // Expected Delivery
    if (cow.expectedDeliveryDate) {
      y += 10
      doc.setFont(undefined, "bold")
      doc.text("Expected Delivery", 14, y)
      doc.setFont(undefined, "normal")
      y += 10
      doc.text(`Expected Date: ${cow.expectedDeliveryDate}`, 16, y)
    }

    return doc
  }

  const downloadCowReport = (cow: Cow) => {
    const doc = generateCowReport(cow)
    doc.save(`cow-report-${cow.tagNumber}-${cow.name}.pdf`)
    toast({
      title: "Downloaded",
      description: `Cow report for ${cow.name} downloaded successfully`,
    })
  }

  const downloadFarmPack = async () => {
    if (cows.length === 0) {
      toast({
        title: "No Data",
        description: "No cows to generate reports for",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPack(true)

    try {
      const zip = new JSZip()

      // Generate PDF for each cow
      for (const cow of cows) {
        const doc = generateCowReport(cow)
        const pdfBlob = doc.output("blob")
        zip.file(`${cow.tagNumber}-${cow.name}-report.pdf`, pdfBlob)
      }

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Download the ZIP
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `farm-pack-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Farm pack with ${cows.length} cow reports downloaded successfully`,
      })
    } catch (error) {
      console.error("Error generating farm pack:", error)
      toast({
        title: "Error",
        description: "Failed to generate farm pack",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPack(false)
    }
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
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Cow Management</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading cows...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {subscriptionState.blocked && (
        <SubscriptionNotice amountDue={subscriptionState.amountDue} cowCount={subscriptionState.cowCount} />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Cow Management</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadFarmPack} disabled={isGeneratingPack || cows.length === 0} variant="outline">
            <Package className="mr-2 h-4 w-4" />
            {isGeneratingPack ? "Generating..." : "Download Farm Pack (ZIP)"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Cow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCow ? "Edit Cow" : "Add New Cow"}</DialogTitle>
                <DialogDescription>
                  {editingCow ? "Update cow information" : "Enter the details for the new cow"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tagNumber" className="text-right">
                      Tag Number *
                    </Label>
                    <Input
                      id="tagNumber"
                      value={formData.tagNumber}
                      onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="breed" className="text-right">
                      Breed *
                    </Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateOfBirth" className="text-right">
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="motherId" className="text-right">
                      Mother
                    </Label>
                    <Select
                      value={formData.motherId}
                      onValueChange={(value) => setFormData({ ...formData, motherId: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select mother (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No mother selected</SelectItem>
                        {cows
                          .filter((cow) => cow.id !== editingCow?.id)
                          .map((cow) => (
                            <SelectItem key={cow.id} value={cow.id}>
                              {cow.tagNumber} - {cow.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expectedDeliveryDate" className="text-right">
                      Expected Delivery
                    </Label>
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Cow["status"]) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pregnant">Pregnant</SelectItem>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingCow ? "Update Cow" : "Add Cow"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {cows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No cows registered yet</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Cow
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cows.map((cow) => (
              <Card key={cow.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {cow.tagNumber} - {cow.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadCowReport(cow)}
                        title="Download Cow Report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cow)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cow.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {cow.breed} • {calculateAge(cow.dateOfBirth)} old
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span
                        className={`text-sm font-medium ${
                          cow.status === "active"
                            ? "text-green-600"
                            : cow.status === "pregnant"
                              ? "text-blue-600"
                              : cow.status === "dry"
                                ? "text-yellow-600"
                                : cow.status === "sold"
                                  ? "text-gray-600"
                                  : "text-red-600"
                        }`}
                      >
                        {cow.status.charAt(0).toUpperCase() + cow.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date of Birth:</span>
                      <span className="text-sm">{cow.dateOfBirth}</span>
                    </div>
                    {cow.motherId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mother:</span>
                        <span className="text-sm">
                          {(() => {
                            const mother = cows.find((c) => c.id === cow.motherId)
                            return mother ? `${mother.tagNumber} - ${mother.name}` : "Unknown"
                          })()}
                        </span>
                      </div>
                    )}
                    {cow.expectedDeliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Expected Delivery:</span>
                        <span className="text-sm">{cow.expectedDeliveryDate}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
