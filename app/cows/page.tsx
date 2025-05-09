"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Save,
  Edit,
  Trash2,
  MilkIcon as Cow,
  AlertTriangle,
  Shield,
  Baby,
  Plus,
  Calendar,
  Users,
} from "lucide-react"
import { format, addDays, differenceInDays, parseISO } from "date-fns"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
interface CowData {
  id: string
  tagNumber: string
  name: string
  breed: string
  dateOfBirth: string
  lactationStatus: {
    lactating: boolean
    dry: boolean
    inCalf: boolean
  }
  purchaseDate?: string
  purchasePrice?: number
  notes?: string
  expectedDeliveryDate?: string
  aiDates: AIRecord[]
  healthStatus: "healthy" | "sick" | "treatment" | "quarantine"
  lastHealthCheck?: string
  insurance?: {
    isInsured: boolean
    provider?: string
    policyNumber?: string
    startDate?: string
    endDate?: string
    coverageAmount?: number
    premium?: number
  }
  nextHeatDate?: string
  pregnancyCheckDate?: string
}

interface AIRecord {
  date: string
  veterinary: string
  breed: string
  cost: number
  time: string
}

// Validation function for lactation status combinations
const isValidLactationStatus = (status: { lactating: boolean; dry: boolean; inCalf: boolean }): boolean => {
  // Cannot be both lactating and dry
  if (status.lactating && status.dry) {
    return false
  }

  // All other combinations are valid
  return true
}

// Function to get display text for lactation status
const getLactationStatusText = (status: { lactating: boolean; dry: boolean; inCalf: boolean }): string => {
  const statuses = []
  if (status.lactating) statuses.push("Lactating")
  if (status.dry) statuses.push("Dry")
  if (status.inCalf) statuses.push("In-Calf")

  return statuses.length > 0 ? statuses.join(" & ") : "Not specified"
}

export default function CowsPage() {
  const [cows, setCows] = useState<CowData[]>([])
  const [tagNumber, setTagNumber] = useState("")
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState(format(new Date(), "yyyy-MM-dd"))
  const [lactationStatus, setLactationStatus] = useState<{ lactating: boolean; dry: boolean; inCalf: boolean }>({
    lactating: false,
    dry: true,
    inCalf: false,
  })
  const [lactationStatusError, setLactationStatusError] = useState<string | null>(null)
  const [purchaseDate, setPurchaseDate] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [notes, setNotes] = useState("")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [aiDates, setAiDates] = useState<AIRecord[]>([])
  const [newAiDate, setNewAiDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [newAiVeterinary, setNewAiVeterinary] = useState("")
  const [newAiBreed, setNewAiBreed] = useState("")
  const [newAiCost, setNewAiCost] = useState("")
  const [newAiTime, setNewAiTime] = useState("")
  const [healthStatus, setHealthStatus] = useState<"healthy" | "sick" | "treatment" | "quarantine">("healthy")
  const [lastHealthCheck, setLastHealthCheck] = useState("")
  const [isInsured, setIsInsured] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [policyNumber, setPolicyNumber] = useState("")
  const [insuranceStartDate, setInsuranceStartDate] = useState("")
  const [insuranceEndDate, setInsuranceEndDate] = useState("")
  const [coverageAmount, setCoverageAmount] = useState("")
  const [premium, setPremium] = useState("")
  const [nextHeatDate, setNextHeatDate] = useState("")
  const [pregnancyCheckDate, setPregnancyCheckDate] = useState("")
  const [editingCow, setEditingCow] = useState<CowData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cowToDelete, setCowToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dryPeriodDialogOpen, setDryPeriodDialogOpen] = useState(false)
  const [cowForDryPeriod, setCowForDryPeriod] = useState<CowData | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCows = localStorage.getItem("cows")
      if (savedCows) {
        try {
          const parsedCows = JSON.parse(savedCows)

          // Convert old format to new format if needed
          const updatedCows = parsedCows.map((cow: any) => {
            // If cow already has the new lactation status format, return as is
            if (typeof cow.lactationStatus === "object" && cow.lactationStatus !== null) {
              return cow
            }

            // Convert old string format to new object format
            const newLactationStatus = {
              lactating: cow.lactationStatus === "lactating",
              dry: cow.lactationStatus === "dry",
              inCalf: cow.lactationStatus === "pregnant",
            }

            return {
              ...cow,
              lactationStatus: newLactationStatus,
            }
          })

          setCows(updatedCows)
          localStorage.setItem("cows", JSON.stringify(updatedCows))

          // Check for cows that need to start dry period
          checkForDryPeriodCows(updatedCows)
        } catch (error) {
          console.error("Error parsing cows data:", error)
          setCows([])
        }
      }
    }
  }, [])

  // Validate lactation status when it changes
  useEffect(() => {
    if (isValidLactationStatus(lactationStatus)) {
      setLactationStatusError(null)
    } else {
      setLactationStatusError("Invalid combination: A cow cannot be both lactating and dry")
    }
  }, [lactationStatus])

  const checkForDryPeriodCows = (cowsData: CowData[]) => {
    const today = new Date()

    for (const cow of cowsData) {
      if (cow.lactationStatus.inCalf && !cow.lactationStatus.dry && cow.expectedDeliveryDate) {
        const deliveryDate = parseISO(cow.expectedDeliveryDate)
        const daysUntilDelivery = differenceInDays(deliveryDate, today)

        // If cow is in-calf and within 60 days of delivery but not yet dry
        if (daysUntilDelivery <= 60 && daysUntilDelivery > 0) {
          setCowForDryPeriod(cow)
          setDryPeriodDialogOpen(true)
          break // Only show one notification at a time
        }
      }
    }
  }

  const handleStartDryPeriod = () => {
    if (!cowForDryPeriod) return

    const updatedCows = cows.map((cow) =>
      cow.id === cowForDryPeriod.id
        ? {
            ...cow,
            lactationStatus: {
              ...cow.lactationStatus,
              lactating: false,
              dry: true,
            },
          }
        : cow,
    )

    setCows(updatedCows)
    localStorage.setItem("cows", JSON.stringify(updatedCows))
    setDryPeriodDialogOpen(false)
    setCowForDryPeriod(null)
  }

  const handleSaveCow = () => {
    if (!tagNumber || !name || !breed || !dateOfBirth || !healthStatus) return

    // Validate lactation status
    if (!isValidLactationStatus(lactationStatus)) {
      return
    }

    // Prepare insurance data
    const insurance = isInsured
      ? {
          isInsured,
          provider: insuranceProvider,
          policyNumber,
          startDate: insuranceStartDate,
          endDate: insuranceEndDate,
          coverageAmount: coverageAmount ? Number.parseFloat(coverageAmount) : undefined,
          premium: premium ? Number.parseFloat(premium) : undefined,
        }
      : { isInsured: false }

    if (editingCow) {
      // Update existing cow
      const updatedCows = cows.map((c) =>
        c.id === editingCow.id
          ? {
              ...editingCow,
              tagNumber,
              name,
              breed,
              dateOfBirth,
              lactationStatus,
              purchaseDate,
              purchasePrice: purchasePrice ? Number.parseFloat(purchasePrice) : undefined,
              notes,
              expectedDeliveryDate,
              aiDates,
              healthStatus,
              lastHealthCheck,
              insurance,
              nextHeatDate,
              pregnancyCheckDate,
            }
          : c,
      )
      setCows(updatedCows)
      localStorage.setItem("cows", JSON.stringify(updatedCows))
    } else {
      // Add new cow
      const cow: CowData = {
        id: Date.now().toString(),
        tagNumber,
        name,
        breed,
        dateOfBirth,
        lactationStatus,
        purchaseDate: purchaseDate || undefined,
        purchasePrice: purchasePrice ? Number.parseFloat(purchasePrice) : undefined,
        notes: notes || undefined,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        aiDates,
        healthStatus,
        lastHealthCheck: lastHealthCheck || undefined,
        insurance,
        nextHeatDate: nextHeatDate || undefined,
        pregnancyCheckDate: pregnancyCheckDate || undefined,
      }

      const updatedCows = [...cows, cow]
      setCows(updatedCows)
      localStorage.setItem("cows", JSON.stringify(updatedCows))
    }

    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setTagNumber("")
    setName("")
    setBreed("")
    setDateOfBirth(format(new Date(), "yyyy-MM-dd"))
    setLactationStatus({ lactating: false, dry: true, inCalf: false })
    setLactationStatusError(null)
    setPurchaseDate("")
    setPurchasePrice("")
    setNotes("")
    setExpectedDeliveryDate("")
    setAiDates([])
    setNewAiDate(format(new Date(), "yyyy-MM-dd"))
    setNewAiVeterinary("")
    setNewAiBreed("")
    setNewAiCost("")
    setNewAiTime("")
    setHealthStatus("healthy")
    setLastHealthCheck("")
    setIsInsured(false)
    setInsuranceProvider("")
    setPolicyNumber("")
    setInsuranceStartDate("")
    setInsuranceEndDate("")
    setCoverageAmount("")
    setPremium("")
    setNextHeatDate("")
    setPregnancyCheckDate("")
    setEditingCow(null)
  }

  const handleDeleteCow = () => {
    if (!cowToDelete) return

    const updatedCows = cows.filter((c) => c.id !== cowToDelete)
    setCows(updatedCows)
    localStorage.setItem("cows", JSON.stringify(updatedCows))
    setCowToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditCow = (cow: CowData) => {
    setEditingCow(cow)
    setTagNumber(cow.tagNumber)
    setName(cow.name)
    setBreed(cow.breed)
    setDateOfBirth(cow.dateOfBirth)
    setLactationStatus(cow.lactationStatus)
    setPurchaseDate(cow.purchaseDate || "")
    setPurchasePrice(cow.purchasePrice?.toString() || "")
    setNotes(cow.notes || "")
    setExpectedDeliveryDate(cow.expectedDeliveryDate || "")
    setAiDates(cow.aiDates || [])
    setHealthStatus(cow.healthStatus)
    setLastHealthCheck(cow.lastHealthCheck || "")
    setNextHeatDate(cow.nextHeatDate || "")
    setPregnancyCheckDate(cow.pregnancyCheckDate || "")

    // Set insurance data
    if (cow.insurance) {
      setIsInsured(cow.insurance.isInsured)
      setInsuranceProvider(cow.insurance.provider || "")
      setPolicyNumber(cow.insurance.policyNumber || "")
      setInsuranceStartDate(cow.insurance.startDate || "")
      setInsuranceEndDate(cow.insurance.endDate || "")
      setCoverageAmount(cow.insurance.coverageAmount?.toString() || "")
      setPremium(cow.insurance.premium?.toString() || "")
    } else {
      setIsInsured(false)
      setInsuranceProvider("")
      setPolicyNumber("")
      setInsuranceStartDate("")
      setInsuranceEndDate("")
      setCoverageAmount("")
      setPremium("")
    }

    setDialogOpen(true)
  }

  const addAiDate = () => {
    if (!newAiDate || !newAiVeterinary || !newAiBreed) return

    const newAiRecord: AIRecord = {
      date: newAiDate,
      veterinary: newAiVeterinary,
      breed: newAiBreed,
      cost: Number(newAiCost) || 0,
      time: newAiTime || format(new Date(), "HH:mm"),
    }

    setAiDates([...aiDates, newAiRecord])

    // Reset AI form fields
    setNewAiDate(format(new Date(), "yyyy-MM-dd"))
    setNewAiVeterinary("")
    setNewAiBreed("")
    setNewAiCost("")
    setNewAiTime("")

    // Auto-calculate expected delivery date (283 days from AI date)
    const aiDate = parseISO(newAiDate)
    const deliveryDate = addDays(aiDate, 283) // Average gestation period for cows
    setExpectedDeliveryDate(format(deliveryDate, "yyyy-MM-dd"))

    // Calculate pregnancy check date (4 months after AI)
    const pregnancyCheckDate = addDays(aiDate, 120) // 4 months after AI
    setPregnancyCheckDate(format(pregnancyCheckDate, "yyyy-MM-dd"))

    // Calculate next possible heat date (21 days after AI if not successful)
    const nextHeatDate = addDays(aiDate, 21) // 21 days cycle
    setNextHeatDate(format(nextHeatDate, "yyyy-MM-dd"))

    // If cow is not already marked as in-calf, update status
    if (!lactationStatus.inCalf) {
      setLactationStatus({
        ...lactationStatus,
        inCalf: true,
      })
    }
  }

  const removeAiDate = (index: number) => {
    const updatedDates = [...aiDates]
    updatedDates.splice(index, 1)
    setAiDates(updatedDates)

    // If we removed the last AI date and there are no more, clear the expected delivery date
    if (updatedDates.length === 0) {
      setExpectedDeliveryDate("")
      setPregnancyCheckDate("")
      setNextHeatDate("")
      // Also update in-calf status if there are no more AI dates
      setLactationStatus({
        ...lactationStatus,
        inCalf: false,
      })
    } else {
      // Recalculate based on the most recent AI date
      const mostRecentAiRecord = updatedDates[updatedDates.length - 1]
      const mostRecentAiDate = parseISO(mostRecentAiRecord.date)

      // Update expected delivery date
      const deliveryDate = addDays(mostRecentAiDate, 283)
      setExpectedDeliveryDate(format(deliveryDate, "yyyy-MM-dd"))

      // Update pregnancy check date
      const pregnancyCheckDate = addDays(mostRecentAiDate, 120)
      setPregnancyCheckDate(format(pregnancyCheckDate, "yyyy-MM-dd"))

      // Update next heat date
      const nextHeatDate = addDays(mostRecentAiDate, 21)
      setNextHeatDate(format(nextHeatDate, "yyyy-MM-dd"))
    }
  }

  // Filter cows by search term
  const filteredCows = cows.filter(
    (cow) =>
      cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cow.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cow.breed.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter cows by lactation status
  const lactatingCows = filteredCows.filter((cow) => cow.lactationStatus.lactating)
  const dryCows = filteredCows.filter((cow) => cow.lactationStatus.dry)
  const inCalfCows = filteredCows.filter((cow) => cow.lactationStatus.inCalf)

  // Calculate cows with upcoming deliveries (within 30 days)
  const upcomingDeliveries = inCalfCows.filter((cow) => {
    if (!cow.expectedDeliveryDate) return false
    const deliveryDate = parseISO(cow.expectedDeliveryDate)
    const daysUntilDelivery = differenceInDays(deliveryDate, new Date())
    return daysUntilDelivery >= 0 && daysUntilDelivery <= 30
  })

  // Calculate cows that should be in dry period (60-0 days before delivery)
  const dryPeriodCows = inCalfCows.filter((cow) => {
    if (!cow.expectedDeliveryDate) return false
    const deliveryDate = parseISO(cow.expectedDeliveryDate)
    const daysUntilDelivery = differenceInDays(deliveryDate, new Date())
    return daysUntilDelivery >= 0 && daysUntilDelivery <= 60 && !cow.lactationStatus.dry
  })

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

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track and manage your dairy cows</p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              resetForm()
              setDialogOpen(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            <Cow className="mr-2 h-4 w-4" /> Add Cow
          </Button>
          <Button asChild variant="outline">
            <Link href="/calves">
              <Baby className="mr-2 h-4 w-4" /> Manage Calves
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/vendors">
              <Users className="mr-2 h-4 w-4" /> Vendors & Milk
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Cows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cows.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">All cows</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Lactating Cows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lactatingCows.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Currently producing milk</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">In-Calf Cows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inCalfCows.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {upcomingDeliveries.length} due in next 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {dryPeriodCows.length > 0 && (
        <Alert className="mb-6 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dry Period Recommended</AlertTitle>
          <AlertDescription>
            {dryPeriodCows.length} cow(s) are approaching their delivery date and should enter the dry period.{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-amber-800 dark:text-amber-400 underline"
              onClick={() => {
                setCowForDryPeriod(dryPeriodCows[0])
                setDryPeriodDialogOpen(true)
              }}
            >
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name, tag number, or breed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="all">All Cows</TabsTrigger>
          <TabsTrigger value="lactating">Lactating</TabsTrigger>
          <TabsTrigger value="dry">Dry</TabsTrigger>
          <TabsTrigger value="incalf">In-Calf</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CowTable
            cows={filteredCows}
            onEdit={handleEditCow}
            onDelete={(id) => {
              setCowToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="lactating">
          <CowTable
            cows={lactatingCows}
            onEdit={handleEditCow}
            onDelete={(id) => {
              setCowToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="dry">
          <CowTable
            cows={dryCows}
            onEdit={handleEditCow}
            onDelete={(id) => {
              setCowToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="incalf">
          <CowTable
            cows={inCalfCows}
            onEdit={handleEditCow}
            onDelete={(id) => {
              setCowToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCow ? "Edit Cow" : "Add New Cow"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tagNumber">Tag Number / Name*</Label>
                <Input
                  id="tagNumber"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  placeholder="Enter tag number or name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Cow Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter cow name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breed">Breed</Label>
                <Select value={breed} onValueChange={setBreed}>
                  <SelectTrigger id="breed">
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Holstein Friesian">Holstein Friesian</SelectItem>
                    <SelectItem value="Jersey">Jersey</SelectItem>
                    <SelectItem value="Guernsey">Guernsey</SelectItem>
                    <SelectItem value="Ayrshire">Ayrshire</SelectItem>
                    <SelectItem value="Brown Swiss">Brown Swiss</SelectItem>
                    <SelectItem value="Sahiwal">Sahiwal</SelectItem>
                    <SelectItem value="Crossbreed">Crossbreed</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="healthStatus">Health Status</Label>
                <Select
                  value={healthStatus}
                  onValueChange={(value: "healthy" | "sick" | "treatment" | "quarantine") => setHealthStatus(value)}
                >
                  <SelectTrigger id="healthStatus">
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="treatment">Under Treatment</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Lactation Status</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lactating"
                    checked={lactationStatus.lactating}
                    onCheckedChange={(checked) => {
                      setLactationStatus({
                        ...lactationStatus,
                        lactating: checked === true,
                      })
                    }}
                  />
                  <Label htmlFor="lactating" className="cursor-pointer">
                    Lactating
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dry"
                    checked={lactationStatus.dry}
                    onCheckedChange={(checked) => {
                      setLactationStatus({
                        ...lactationStatus,
                        dry: checked === true,
                      })
                    }}
                  />
                  <Label htmlFor="dry" className="cursor-pointer">
                    Dry
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inCalf"
                    checked={lactationStatus.inCalf}
                    onCheckedChange={(checked) => {
                      setLactationStatus({
                        ...lactationStatus,
                        inCalf: checked === true,
                      })
                    }}
                  />
                  <Label htmlFor="inCalf" className="cursor-pointer">
                    In-Calf
                  </Label>
                </div>
              </div>
              {lactationStatusError && <p className="text-sm text-red-500 mt-1">{lactationStatusError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Purchase Date (if purchased)</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Purchase Price (KSH)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastHealthCheck">Last Health Check</Label>
                <Input
                  id="lastHealthCheck"
                  type="date"
                  value={lastHealthCheck}
                  onChange={(e) => setLastHealthCheck(e.target.value)}
                />
              </div>
            </div>

            {/* AI Dates Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-medium">AI Records</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="aiDate">AI Date</Label>
                  <Input id="aiDate" type="date" value={newAiDate} onChange={(e) => setNewAiDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aiTime">Time</Label>
                  <Input id="aiTime" type="time" value={newAiTime} onChange={(e) => setNewAiTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aiVeterinary">Veterinary</Label>
                  <Input
                    id="aiVeterinary"
                    value={newAiVeterinary}
                    onChange={(e) => setNewAiVeterinary(e.target.value)}
                    placeholder="Enter veterinary name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aiBreed">Breed Used</Label>
                  <Input
                    id="aiBreed"
                    value={newAiBreed}
                    onChange={(e) => setNewAiBreed(e.target.value)}
                    placeholder="Enter breed used"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aiCost">Cost (KSH)</Label>
                  <Input
                    id="aiCost"
                    type="number"
                    value={newAiCost}
                    onChange={(e) => setNewAiCost(e.target.value)}
                    placeholder="Enter cost"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addAiDate} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add AI Record
                  </Button>
                </div>
              </div>

              {aiDates.length > 0 && (
                <div className="mt-2 mb-4">
                  <h4 className="text-sm font-medium mb-2">AI History</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Date</th>
                            <th className="text-left py-2">Time</th>
                            <th className="text-left py-2">Veterinary</th>
                            <th className="text-left py-2">Breed</th>
                            <th className="text-left py-2">Cost</th>
                            <th className="text-right py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiDates.map((record, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{format(parseISO(record.date), "MMM dd, yyyy")}</td>
                              <td className="py-2">{record.time || "-"}</td>
                              <td className="py-2">{record.veterinary}</td>
                              <td className="py-2">{record.breed}</td>
                              <td className="py-2">{record.cost ? `KSH ${record.cost}` : "-"}</td>
                              <td className="py-2 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => removeAiDate(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    readOnly={aiDates.length > 0}
                    className={aiDates.length > 0 ? "bg-gray-100 dark:bg-gray-800" : ""}
                  />
                  {aiDates.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Auto-calculated based on the most recent AI date (283 days gestation period)
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nextHeatDate">Next Heat Date (if AI fails)</Label>
                  <Input
                    id="nextHeatDate"
                    type="date"
                    value={nextHeatDate}
                    onChange={(e) => setNextHeatDate(e.target.value)}
                    readOnly={aiDates.length > 0}
                    className={aiDates.length > 0 ? "bg-gray-100 dark:bg-gray-800" : ""}
                  />
                  {aiDates.length > 0 && <p className="text-xs text-gray-500">21 days after the most recent AI</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pregnancyCheckDate">Pregnancy Check Date</Label>
                  <Input
                    id="pregnancyCheckDate"
                    type="date"
                    value={pregnancyCheckDate}
                    onChange={(e) => setPregnancyCheckDate(e.target.value)}
                    readOnly={aiDates.length > 0}
                    className={aiDates.length > 0 ? "bg-gray-100 dark:bg-gray-800" : ""}
                  />
                  {aiDates.length > 0 && <p className="text-xs text-gray-500">4 months after the most recent AI</p>}
                </div>
              </div>
            </div>

            {/* Insurance Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium">Insurance Information</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isInsured" className="text-sm">
                    Insured
                  </Label>
                  <Switch id="isInsured" checked={isInsured} onCheckedChange={setIsInsured} />
                </div>
              </div>

              {isInsured && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      placeholder="Enter provider name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      placeholder="Enter policy number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insuranceStartDate">Start Date</Label>
                    <Input
                      id="insuranceStartDate"
                      type="date"
                      value={insuranceStartDate}
                      onChange={(e) => setInsuranceStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insuranceEndDate">End Date</Label>
                    <Input
                      id="insuranceEndDate"
                      type="date"
                      value={insuranceEndDate}
                      onChange={(e) => setInsuranceEndDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="coverageAmount">Coverage Amount (KSH)</Label>
                    <Input
                      id="coverageAmount"
                      type="number"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      placeholder="Enter coverage amount"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="premium">Premium (KSH)</Label>
                    <Input
                      id="premium"
                      type="number"
                      value={premium}
                      onChange={(e) => setPremium(e.target.value)}
                      placeholder="Enter premium amount"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about the cow"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveCow}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!tagNumber || !name || !breed || !dateOfBirth || !healthStatus || !!lactationStatusError}
            >
              <Save className="mr-2 h-4 w-4" /> {editingCow ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cow record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCow}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dryPeriodDialogOpen} onOpenChange={setDryPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Dry Period</DialogTitle>
          </DialogHeader>
          {cowForDryPeriod && (
            <>
              <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Dry Period Recommended</AlertTitle>
                <AlertDescription>
                  {cowForDryPeriod.name} (Tag: {cowForDryPeriod.tagNumber}) is{" "}
                  {differenceInDays(parseISO(cowForDryPeriod.expectedDeliveryDate!), new Date())} days away from
                  delivery. It's recommended to start the dry period now to prepare for calving.
                </AlertDescription>
              </Alert>
              <div className="py-4">
                <p>
                  Starting the dry period will change the cow's status from "In-Calf & Lactating" to "In-Calf & Dry".
                  This will help the cow prepare for the upcoming calving and the next lactation cycle.
                </p>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDryPeriodDialogOpen(false)}>
              Remind Me Later
            </Button>
            <Button
              onClick={handleStartDryPeriod}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Start Dry Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for cow table
function CowTable({
  cows,
  onEdit,
  onDelete,
}: {
  cows: CowData[]
  onEdit: (cow: CowData) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cow Records</CardTitle>
      </CardHeader>
      <CardContent>
        {cows.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Cow className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>No cow records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tag/Name</th>
                  <th className="text-left py-2">Breed</th>
                  <th className="text-left py-2">Age</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Health</th>
                  <th className="text-left py-2">Insurance</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cows.map((cow) => {
                  // Calculate age in years
                  const birthDate = parseISO(cow.dateOfBirth)
                  const ageInYears = Math.floor(
                    (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
                  )
                  const ageInMonths = Math.floor(
                    (new Date().getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000),
                  )
                  const ageDisplay =
                    ageInYears > 0 ? `${ageInYears} year${ageInYears !== 1 ? "s" : ""}` : `${ageInMonths} months`

                  // Calculate days until delivery for in-calf cows
                  let daysUntilDelivery = null
                  if (cow.lactationStatus.inCalf && cow.expectedDeliveryDate) {
                    daysUntilDelivery = differenceInDays(parseISO(cow.expectedDeliveryDate), new Date())
                  }

                  // Get status text
                  const statusText = getLactationStatusText(cow.lactationStatus)

                  return (
                    <tr key={cow.id} className="border-b">
                      <td className="py-2 font-medium">{cow.tagNumber}</td>
                      <td className="py-2">{cow.breed}</td>
                      <td className="py-2">{ageDisplay}</td>
                      <td className="py-2">
                        <Badge
                          className={`${
                            cow.lactationStatus.lactating && !cow.lactationStatus.dry && !cow.lactationStatus.inCalf
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : cow.lactationStatus.inCalf
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {statusText}
                          {daysUntilDelivery !== null && daysUntilDelivery >= 0 && (
                            <span className="ml-1">({daysUntilDelivery} days left)</span>
                          )}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge
                          className={`${
                            cow.healthStatus === "healthy"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : cow.healthStatus === "sick"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : cow.healthStatus === "treatment"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {cow.healthStatus}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {cow.insurance?.isInsured ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Insured
                          </Badge>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not insured</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(cow)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(cow.id)}>
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
