"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Edit, Trash2, MilkIcon as Cow } from "lucide-react"
import { format } from "date-fns"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
interface CowData {
  id: string
  tagNumber: string
  name: string
  expectedDeliveryDate: string
  aiDates: string[]
}

interface Calf {
  id: string
  name: string
  tagNumber: string
  birthDate: string
  motherId: string
  sex: "male" | "female"
  breed: string
  birthWeight?: number
  notes?: string
  status: "active" | "sold" | "deceased"
}

export default function CalvesPage() {
  const [calves, setCalves] = useState<Calf[]>([])
  const [cows, setCows] = useState<CowData[]>([])
  const [name, setName] = useState("")
  const [tagNumber, setTagNumber] = useState("")
  const [birthDate, setBirthDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [motherId, setMotherId] = useState("")
  const [sex, setSex] = useState<"male" | "female">("female")
  const [breed, setBreed] = useState("")
  const [birthWeight, setBirthWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"active" | "sold" | "deceased">("active")
  const [editingCalf, setEditingCalf] = useState<Calf | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [calfToDelete, setCalfToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCalves = localStorage.getItem("calves")
      if (savedCalves) setCalves(JSON.parse(savedCalves))

      const savedCows = localStorage.getItem("cows")
      if (savedCows) setCows(JSON.parse(savedCows))
    }
  }, [])

  const handleSaveCalf = () => {
    if (!name || !tagNumber || !birthDate || !motherId || !sex || !breed || !status) return

    if (editingCalf) {
      // Update existing calf
      const updatedCalves = calves.map((c) =>
        c.id === editingCalf.id
          ? {
              ...editingCalf,
              name,
              tagNumber,
              birthDate,
              motherId,
              sex,
              breed,
              birthWeight: birthWeight ? Number.parseFloat(birthWeight) : undefined,
              notes,
              status,
            }
          : c,
      )
      setCalves(updatedCalves)
      localStorage.setItem("calves", JSON.stringify(updatedCalves))
    } else {
      // Add new calf
      const calf: Calf = {
        id: Date.now().toString(),
        name,
        tagNumber,
        birthDate,
        motherId,
        sex,
        breed,
        birthWeight: birthWeight ? Number.parseFloat(birthWeight) : undefined,
        notes,
        status,
      }

      const updatedCalves = [...calves, calf]
      setCalves(updatedCalves)
      localStorage.setItem("calves", JSON.stringify(updatedCalves))
    }

    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setName("")
    setTagNumber("")
    setBirthDate(format(new Date(), "yyyy-MM-dd"))
    setMotherId("")
    setSex("female")
    setBreed("")
    setBirthWeight("")
    setNotes("")
    setStatus("active")
    setEditingCalf(null)
  }

  const handleDeleteCalf = () => {
    if (!calfToDelete) return

    const updatedCalves = calves.filter((c) => c.id !== calfToDelete)
    setCalves(updatedCalves)
    localStorage.setItem("calves", JSON.stringify(updatedCalves))
    setCalfToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditCalf = (calf: Calf) => {
    setEditingCalf(calf)
    setName(calf.name)
    setTagNumber(calf.tagNumber)
    setBirthDate(calf.birthDate)
    setMotherId(calf.motherId)
    setSex(calf.sex)
    setBreed(calf.breed)
    setBirthWeight(calf.birthWeight?.toString() || "")
    setNotes(calf.notes || "")
    setStatus(calf.status)
    setDialogOpen(true)
  }

  // Filter calves by status for tabs
  const activeCalves = calves.filter((calf) => calf.status === "active")
  const soldCalves = calves.filter((calf) => calf.status === "sold")
  const deceasedCalves = calves.filter((calf) => calf.status === "deceased")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Calf Management</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track and manage your calves</p>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Cow className="mr-2 h-4 w-4" /> Add Calf
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Calves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calves.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">All calves</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Calves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCalves.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Currently in the herd</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Births</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                calves.filter(
                  (calf) => new Date(calf.birthDate) >= new Date(new Date().setMonth(new Date().getMonth() - 3)),
                ).length
              }
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last 3 months</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="active">Active Calves</TabsTrigger>
          <TabsTrigger value="sold">Sold</TabsTrigger>
          <TabsTrigger value="deceased">Deceased</TabsTrigger>
          <TabsTrigger value="all">All Calves</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <CalfTable
            calves={activeCalves}
            cows={cows}
            onEdit={handleEditCalf}
            onDelete={(id) => {
              setCalfToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="sold">
          <CalfTable
            calves={soldCalves}
            cows={cows}
            onEdit={handleEditCalf}
            onDelete={(id) => {
              setCalfToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="deceased">
          <CalfTable
            calves={deceasedCalves}
            cows={cows}
            onEdit={handleEditCalf}
            onDelete={(id) => {
              setCalfToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="all">
          <CalfTable
            calves={calves}
            cows={cows}
            onEdit={handleEditCalf}
            onDelete={(id) => {
              setCalfToDelete(id)
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCalf ? "Edit Calf" : "Add New Calf"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter calf name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tagNumber">Tag Number</Label>
                <Input
                  id="tagNumber"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  placeholder="Enter tag number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="motherId">Mother</Label>
                <Select value={motherId} onValueChange={setMotherId}>
                  <SelectTrigger id="motherId">
                    <SelectValue placeholder="Select mother cow" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={sex} onValueChange={(value: "male" | "female") => setSex(value)}>
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="grid gap-2">
                <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
                <Input
                  id="birthWeight"
                  type="number"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "active" | "sold" | "deceased") => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveCalf}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!name || !tagNumber || !birthDate || !motherId || !sex || !breed || !status}
            >
              <Save className="mr-2 h-4 w-4" /> {editingCalf ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this calf record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCalf}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for calf table
function CalfTable({
  calves,
  cows,
  onEdit,
  onDelete,
}: {
  calves: Calf[]
  cows: CowData[]
  onEdit: (calf: Calf) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calf Records</CardTitle>
      </CardHeader>
      <CardContent>
        {calves.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Cow className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>No calf records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tag Number</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Birth Date</th>
                  <th className="text-left py-2">Mother</th>
                  <th className="text-left py-2">Sex</th>
                  <th className="text-left py-2">Breed</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calves
                  .sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime())
                  .map((calf) => {
                    const mother = cows.find((c) => c.id === calf.motherId)
                    return (
                      <tr key={calf.id} className="border-b">
                        <td className="py-2 font-medium">{calf.tagNumber}</td>
                        <td className="py-2">{calf.name}</td>
                        <td className="py-2">{format(new Date(calf.birthDate), "MMM dd, yyyy")}</td>
                        <td className="py-2">{mother ? `${mother.tagNumber} - ${mother.name}` : "Unknown"}</td>
                        <td className="py-2 capitalize">{calf.sex}</td>
                        <td className="py-2">{calf.breed}</td>
                        <td className="py-2">
                          <Badge
                            className={`${
                              calf.status === "active"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : calf.status === "sold"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {calf.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(calf)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(calf.id)}>
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
