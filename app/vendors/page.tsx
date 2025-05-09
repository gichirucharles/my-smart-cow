"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Pencil, Trash2, Users, MilkIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
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

// Types
interface Vendor {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  defaultMilkPrice?: number // Add default milk price for vendor
}

interface MilkCollection {
  id: string
  vendorId: string
  date: string
  timeOfDay: "morning" | "day" | "evening"
  quantity: number
  price: number
  notes?: string
}

export default function VendorsPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [collections, setCollections] = useState<MilkCollection[]>([])
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false)
  const [isDeleteVendorOpen, setIsDeleteVendorOpen] = useState(false)
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false)
  const [isDeleteCollectionOpen, setIsDeleteCollectionOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<MilkCollection | null>(null)
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    defaultMilkPrice: 0, // Initialize default milk price
  })
  const [newCollection, setNewCollection] = useState<Partial<MilkCollection>>({
    vendorId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    timeOfDay: "morning",
    quantity: 0,
    price: 0,
    notes: "",
  })
  const [defaultMilkPrice, setDefaultMilkPrice] = useState<number>(0)
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVendors = localStorage.getItem("vendors")
      if (savedVendors) setVendors(JSON.parse(savedVendors))

      const savedCollections = localStorage.getItem("milkCollections")
      if (savedCollections) setCollections(JSON.parse(savedCollections))

      // Get the default milk price from app settings
      const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
      if (settings.milkPrice) {
        setDefaultMilkPrice(settings.milkPrice)

        // Set the default price for new collections
        setNewCollection((prev) => ({
          ...prev,
          price: settings.milkPrice,
        }))
      } else {
        // If no price is set in settings, check if there's an active price in milk prices
        const milkPrices = JSON.parse(localStorage.getItem("milkPrices") || "[]")
        const today = new Date().toISOString().split("T")[0]
        const activePrice = milkPrices.find(
          (p: any) => p.effectiveFrom <= today && (!p.effectiveTo || p.effectiveTo >= today),
        )

        if (activePrice) {
          setDefaultMilkPrice(activePrice.price)

          // Set the default price for new collections
          setNewCollection((prev) => ({
            ...prev,
            price: activePrice.price,
          }))

          // Update app settings
          settings.milkPrice = activePrice.price
          localStorage.setItem("appSettings", JSON.stringify(settings))
        }
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

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.phone) return

    const vendor: Vendor = {
      id: Date.now().toString(),
      name: newVendor.name,
      phone: newVendor.phone,
      email: newVendor.email || "",
      address: newVendor.address || "",
      notes: newVendor.notes || "",
      defaultMilkPrice: newVendor.defaultMilkPrice || defaultMilkPrice, // Use vendor-specific price or global default
    }

    const updatedVendors = [...vendors, vendor]
    setVendors(updatedVendors)
    localStorage.setItem("vendors", JSON.stringify(updatedVendors))

    setNewVendor({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      defaultMilkPrice: defaultMilkPrice,
    })
    setIsAddVendorOpen(false)

    toast({
      title: "Vendor Added",
      description: `${vendor.name} has been added successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Vendor Added",
      details: `Added vendor: ${vendor.name}`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  const handleEditVendor = () => {
    if (!selectedVendor || !newVendor.name || !newVendor.phone) return

    const updatedVendor: Vendor = {
      ...selectedVendor,
      name: newVendor.name,
      phone: newVendor.phone,
      email: newVendor.email || "",
      address: newVendor.address || "",
      notes: newVendor.notes || "",
      defaultMilkPrice: newVendor.defaultMilkPrice || selectedVendor.defaultMilkPrice || defaultMilkPrice,
    }

    const updatedVendors = vendors.map((v) => (v.id === selectedVendor.id ? updatedVendor : v))
    setVendors(updatedVendors)
    localStorage.setItem("vendors", JSON.stringify(updatedVendors))

    setNewVendor({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      defaultMilkPrice: defaultMilkPrice,
    })
    setSelectedVendor(null)
    setIsEditVendorOpen(false)

    toast({
      title: "Vendor Updated",
      description: `${updatedVendor.name} has been updated successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Vendor Updated",
      details: `Updated vendor: ${updatedVendor.name}`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  const handleDeleteVendor = () => {
    if (!selectedVendor) return

    const updatedVendors = vendors.filter((v) => v.id !== selectedVendor.id)
    setVendors(updatedVendors)
    localStorage.setItem("vendors", JSON.stringify(updatedVendors))

    // Also delete all collections for this vendor
    const updatedCollections = collections.filter((c) => c.vendorId !== selectedVendor.id)
    setCollections(updatedCollections)
    localStorage.setItem("milkCollections", JSON.stringify(updatedCollections))

    setSelectedVendor(null)
    setIsDeleteVendorOpen(false)

    toast({
      title: "Vendor Deleted",
      description: `${selectedVendor.name} has been deleted successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Vendor Deleted",
      details: `Deleted vendor: ${selectedVendor.name}`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  const handleAddCollection = () => {
    if (!newCollection.vendorId || !newCollection.date || !newCollection.quantity || !newCollection.price) return

    // Validate date
    if (!validateDate(newCollection.date as string)) return

    const collection: MilkCollection = {
      id: Date.now().toString(),
      vendorId: newCollection.vendorId,
      date: newCollection.date,
      timeOfDay: newCollection.timeOfDay as "morning" | "day" | "evening",
      quantity: Number(newCollection.quantity),
      price: Number(newCollection.price),
      notes: newCollection.notes || "",
    }

    const updatedCollections = [...collections, collection]
    setCollections(updatedCollections)
    localStorage.setItem("milkCollections", JSON.stringify(updatedCollections))

    // Reset form but keep the vendor ID selected
    const selectedVendorId = newCollection.vendorId
    setNewCollection({
      vendorId: selectedVendorId,
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "morning",
      quantity: 0,
      price: getVendorMilkPrice(selectedVendorId), // Use vendor-specific price
      notes: "",
    })
    setIsAddCollectionOpen(false)

    const vendor = vendors.find((v) => v.id === collection.vendorId)
    toast({
      title: "Collection Added",
      description: `Collection for ${vendor?.name} has been added successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Milk Collection Added",
      details: `Added milk collection: ${collection.quantity}L from ${vendor?.name} (${collection.timeOfDay})`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  const handleEditCollection = () => {
    if (
      !selectedCollection ||
      !newCollection.vendorId ||
      !newCollection.date ||
      !newCollection.quantity ||
      !newCollection.price
    )
      return

    // Validate date
    if (!validateDate(newCollection.date as string)) return

    const updatedCollection: MilkCollection = {
      ...selectedCollection,
      vendorId: newCollection.vendorId,
      date: newCollection.date,
      timeOfDay: newCollection.timeOfDay as "morning" | "day" | "evening",
      quantity: Number(newCollection.quantity),
      price: Number(newCollection.price),
      notes: newCollection.notes || "",
    }

    const updatedCollections = collections.map((c) => (c.id === selectedCollection.id ? updatedCollection : c))
    setCollections(updatedCollections)
    localStorage.setItem("milkCollections", JSON.stringify(updatedCollections))

    setNewCollection({
      vendorId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "morning",
      quantity: 0,
      price: defaultMilkPrice,
      notes: "",
    })
    setSelectedCollection(null)
    setIsEditCollectionOpen(false)

    const vendor = vendors.find((v) => v.id === updatedCollection.vendorId)
    toast({
      title: "Collection Updated",
      description: `Collection for ${vendor?.name} has been updated successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Milk Collection Updated",
      details: `Updated milk collection: ${updatedCollection.quantity}L from ${vendor?.name} (${updatedCollection.timeOfDay})`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  const handleDeleteCollection = () => {
    if (!selectedCollection) return

    const updatedCollections = collections.filter((c) => c.id !== selectedCollection.id)
    setCollections(updatedCollections)
    localStorage.setItem("milkCollections", JSON.stringify(updatedCollections))

    const vendor = vendors.find((v) => v.id === selectedCollection.vendorId)
    setSelectedCollection(null)
    setIsDeleteCollectionOpen(false)

    toast({
      title: "Collection Deleted",
      description: `Collection for ${vendor?.name} has been deleted successfully.`,
    })

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "Milk Collection Deleted",
      details: `Deleted milk collection: ${selectedCollection.quantity}L from ${vendor?.name} (${selectedCollection.timeOfDay})`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))
  }

  // Get vendor-specific milk price or use default
  const getVendorMilkPrice = (vendorId: string): number => {
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor?.defaultMilkPrice || defaultMilkPrice
  }

  // Handle vendor selection in collection form
  const handleVendorSelect = (vendorId: string) => {
    const vendorPrice = getVendorMilkPrice(vendorId)
    setNewCollection({
      ...newCollection,
      vendorId,
      price: vendorPrice,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Vendors & Collections</h1>
      </div>

      <Tabs defaultValue="vendors" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="vendors" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Vendors
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-1">
            <MilkIcon className="h-4 w-4" /> Milk Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Vendors</CardTitle>
              <Button
                onClick={() => setIsAddVendorOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No vendors available</p>
                  <Button onClick={() => setIsAddVendorOpen(true)} variant="outline" className="mt-4">
                    Add Your First Vendor
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Milk Price (KSH)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>{vendor.phone}</TableCell>
                          <TableCell>{vendor.email || "-"}</TableCell>
                          <TableCell>{vendor.address || "-"}</TableCell>
                          <TableCell>{vendor.defaultMilkPrice?.toFixed(2) || defaultMilkPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedVendor(vendor)
                                  setNewVendor({
                                    name: vendor.name,
                                    phone: vendor.phone,
                                    email: vendor.email,
                                    address: vendor.address,
                                    notes: vendor.notes,
                                    defaultMilkPrice: vendor.defaultMilkPrice,
                                  })
                                  setIsEditVendorOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setSelectedVendor(vendor)
                                  setIsDeleteVendorOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Milk Collections</CardTitle>
              <Button
                onClick={() => setIsAddCollectionOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                disabled={vendors.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" /> Record Collection
              </Button>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Please add vendors before recording collections</p>
                  <Button onClick={() => setIsAddVendorOpen(true)} variant="outline" className="mt-4">
                    Add Vendor
                  </Button>
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MilkIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No milk collections recorded</p>
                  <Button onClick={() => setIsAddCollectionOpen(true)} variant="outline" className="mt-4">
                    Record Your First Collection
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time of Day</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Quantity (L)</TableHead>
                        <TableHead>Price (KSH)</TableHead>
                        <TableHead>Total (KSH)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((collection) => {
                          const vendor = vendors.find((v) => v.id === collection.vendorId)
                          return (
                            <TableRow key={collection.id}>
                              <TableCell>{format(new Date(collection.date), "MMM dd, yyyy")}</TableCell>
                              <TableCell>
                                <span className="capitalize">{collection.timeOfDay}</span>
                              </TableCell>
                              <TableCell className="font-medium">{vendor?.name || "Unknown"}</TableCell>
                              <TableCell>{collection.quantity.toFixed(1)}</TableCell>
                              <TableCell>{collection.price.toFixed(2)}</TableCell>
                              <TableCell>{(collection.quantity * collection.price).toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCollection(collection)
                                      setNewCollection({
                                        vendorId: collection.vendorId,
                                        date: collection.date,
                                        timeOfDay: collection.timeOfDay,
                                        quantity: collection.quantity,
                                        price: collection.price,
                                        notes: collection.notes,
                                      })
                                      setIsEditCollectionOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedCollection(collection)
                                      setIsDeleteCollectionOpen(true)
                                    }}
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
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>Add a new milk vendor to your records.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone*
              </Label>
              <Input
                id="phone"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultMilkPrice" className="text-right">
                Milk Price (KSH)
              </Label>
              <Input
                id="defaultMilkPrice"
                type="number"
                step="0.01"
                value={newVendor.defaultMilkPrice}
                onChange={(e) => setNewVendor({ ...newVendor, defaultMilkPrice: Number(e.target.value) })}
                className="col-span-3"
              />
              {defaultMilkPrice > 0 && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Current default price: KSH {defaultMilkPrice.toFixed(2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={newVendor.notes}
                onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVendor} disabled={!newVendor.name || !newVendor.phone}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update vendor information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name*
              </Label>
              <Input
                id="edit-name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone*
              </Label>
              <Input
                id="edit-phone"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-address"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-defaultMilkPrice" className="text-right">
                Milk Price (KSH)
              </Label>
              <Input
                id="edit-defaultMilkPrice"
                type="number"
                step="0.01"
                value={newVendor.defaultMilkPrice}
                onChange={(e) => setNewVendor({ ...newVendor, defaultMilkPrice: Number(e.target.value) })}
                className="col-span-3"
              />
              {defaultMilkPrice > 0 && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Current default price: KSH {defaultMilkPrice.toFixed(2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="edit-notes"
                value={newVendor.notes}
                onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditVendorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVendor} disabled={!newVendor.name || !newVendor.phone}>
              Update Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Vendor Dialog */}
      <Dialog open={isDeleteVendorOpen} onOpenChange={setIsDeleteVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedVendor?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteVendorOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVendor}>
              Delete Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Collection Dialog */}
      <Dialog open={isAddCollectionOpen} onOpenChange={setIsAddCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Milk Collection</DialogTitle>
            <DialogDescription>Record a new milk collection from a vendor.</DialogDescription>
          </DialogHeader>

          {dateError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Date</AlertTitle>
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor" className="text-right">
                Vendor*
              </Label>
              <Select value={newCollection.vendorId} onValueChange={handleVendorSelect}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
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
                value={newCollection.date}
                onChange={(e) => {
                  setNewCollection({ ...newCollection, date: e.target.value })
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
                value={newCollection.timeOfDay}
                onValueChange={(value) =>
                  setNewCollection({ ...newCollection, timeOfDay: value as "morning" | "day" | "evening" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
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
                value={newCollection.quantity}
                onChange={(e) => setNewCollection({ ...newCollection, quantity: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price per Liter*
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newCollection.price}
                onChange={(e) => setNewCollection({ ...newCollection, price: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
              {newCollection.vendorId && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Vendor's default price: KSH {getVendorMilkPrice(newCollection.vendorId).toFixed(2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={newCollection.notes}
                onChange={(e) => setNewCollection({ ...newCollection, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCollectionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCollection}
              disabled={
                !newCollection.vendorId ||
                !newCollection.date ||
                !newCollection.quantity ||
                !newCollection.price ||
                !!dateError
              }
            >
              Record Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditCollectionOpen} onOpenChange={setIsEditCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milk Collection</DialogTitle>
            <DialogDescription>Update milk collection details.</DialogDescription>
          </DialogHeader>

          {dateError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Date</AlertTitle>
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-vendor" className="text-right">
                Vendor*
              </Label>
              <Select value={newCollection.vendorId} onValueChange={handleVendorSelect}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
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
                value={newCollection.date}
                onChange={(e) => {
                  setNewCollection({ ...newCollection, date: e.target.value })
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
                value={newCollection.timeOfDay}
                onValueChange={(value) =>
                  setNewCollection({ ...newCollection, timeOfDay: value as "morning" | "day" | "evening" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
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
                value={newCollection.quantity}
                onChange={(e) => setNewCollection({ ...newCollection, quantity: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price per Liter*
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={newCollection.price}
                onChange={(e) => setNewCollection({ ...newCollection, price: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
              {newCollection.vendorId && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Vendor's default price: KSH {getVendorMilkPrice(newCollection.vendorId).toFixed(2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="edit-notes"
                value={newCollection.notes}
                onChange={(e) => setNewCollection({ ...newCollection, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCollectionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditCollection}
              disabled={
                !newCollection.vendorId ||
                !newCollection.date ||
                !newCollection.quantity ||
                !newCollection.price ||
                !!dateError
              }
            >
              Update Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Dialog */}
      <Dialog open={isDeleteCollectionOpen} onOpenChange={setIsDeleteCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this milk collection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCollectionOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection}>
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
