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
import { vendorOperations, milkCollectionOperations } from "@/lib/supabase-operations"
import { isSupabaseConfigured } from "@/lib/supabase"

// Types
interface Vendor {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  milk_price_per_liter?: number
  vendor_type: string
}

interface MilkCollection {
  id: string
  vendor_id: string
  collection_date: string
  time_of_day: "morning" | "day" | "evening"
  quantity_liters: number
  price_per_liter: number
  total_amount: number
  notes?: string
  vendors?: {
    id: string
    name: string
    phone: string
  }
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    milk_price_per_liter: 0,
    vendor_type: "buyer",
  })
  const [newCollection, setNewCollection] = useState<Partial<MilkCollection>>({
    vendor_id: "",
    collection_date: format(new Date(), "yyyy-MM-dd"),
    time_of_day: "morning",
    quantity_liters: 0,
    price_per_liter: 0,
    notes: "",
  })
  const [defaultMilkPrice, setDefaultMilkPrice] = useState<number>(0)
  const [dateError, setDateError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()

    // Set up real-time subscriptions if Supabase is configured
    if (isSupabaseConfigured()) {
      const unsubscribeVendors = vendorOperations.subscribe((payload) => {
        console.log("Vendors changed:", payload)
        loadVendors()
      })

      const unsubscribeCollections = milkCollectionOperations.subscribe((payload) => {
        console.log("Milk collections changed:", payload)
        loadCollections()
      })

      return () => {
        unsubscribeVendors()
        unsubscribeCollections()
      }
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadVendors(), loadCollections()])

      // Get the default milk price from app settings
      if (typeof window !== "undefined") {
        const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
        if (settings.milkPrice) {
          setDefaultMilkPrice(settings.milkPrice)
          setNewCollection((prev) => ({
            ...prev,
            price_per_liter: settings.milkPrice,
          }))
        }
      }
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

  const loadVendors = async () => {
    try {
      const vendorsData = await vendorOperations.getAll()
      setVendors(vendorsData)
    } catch (error) {
      console.error("Error loading vendors:", error)
    }
  }

  const loadCollections = async () => {
    try {
      const collectionsData = await milkCollectionOperations.getAll()
      setCollections(collectionsData)
    } catch (error) {
      console.error("Error loading collections:", error)
    }
  }

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

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.phone) return

    setSaving(true)
    try {
      const vendorData = {
        name: newVendor.name,
        phone: newVendor.phone,
        email: newVendor.email || "",
        address: newVendor.address || "",
        notes: newVendor.notes || "",
        milk_price_per_liter: newVendor.milk_price_per_liter || defaultMilkPrice,
        vendor_type: newVendor.vendor_type || "buyer",
      }

      await vendorOperations.create(vendorData)
      await loadVendors()

      setNewVendor({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        milk_price_per_liter: defaultMilkPrice,
        vendor_type: "buyer",
      })
      setIsAddVendorOpen(false)

      toast({
        title: "Vendor Added",
        description: `${vendorData.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding vendor:", error)
      toast({
        title: "Error",
        description: "Failed to add vendor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditVendor = async () => {
    if (!selectedVendor || !newVendor.name || !newVendor.phone) return

    setSaving(true)
    try {
      const updates = {
        name: newVendor.name,
        phone: newVendor.phone,
        email: newVendor.email || "",
        address: newVendor.address || "",
        notes: newVendor.notes || "",
        milk_price_per_liter: newVendor.milk_price_per_liter || selectedVendor.milk_price_per_liter || defaultMilkPrice,
        vendor_type: newVendor.vendor_type || selectedVendor.vendor_type,
      }

      await vendorOperations.update(selectedVendor.id, updates)
      await loadVendors()

      setNewVendor({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        milk_price_per_liter: defaultMilkPrice,
        vendor_type: "buyer",
      })
      setSelectedVendor(null)
      setIsEditVendorOpen(false)

      toast({
        title: "Vendor Updated",
        description: `${updates.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating vendor:", error)
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return

    try {
      await vendorOperations.delete(selectedVendor.id)
      await Promise.all([loadVendors(), loadCollections()])

      setSelectedVendor(null)
      setIsDeleteVendorOpen(false)

      toast({
        title: "Vendor Deleted",
        description: `${selectedVendor.name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting vendor:", error)
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddCollection = async () => {
    if (
      !newCollection.vendor_id ||
      !newCollection.collection_date ||
      !newCollection.quantity_liters ||
      !newCollection.price_per_liter
    )
      return

    // Validate date
    if (!validateDate(newCollection.collection_date as string)) return

    setSaving(true)
    try {
      const collectionData = {
        vendor_id: newCollection.vendor_id,
        collection_date: newCollection.collection_date,
        collection_time: "08:00", // Default time
        time_of_day: newCollection.time_of_day as "morning" | "day" | "evening",
        quantity_liters: Number(newCollection.quantity_liters),
        price_per_liter: Number(newCollection.price_per_liter),
        notes: newCollection.notes || "",
      }

      await milkCollectionOperations.create(collectionData)
      await loadCollections()

      // Reset form but keep the vendor ID selected
      const selectedVendorId = newCollection.vendor_id
      setNewCollection({
        vendor_id: selectedVendorId,
        collection_date: format(new Date(), "yyyy-MM-dd"),
        time_of_day: "morning",
        quantity_liters: 0,
        price_per_liter: getVendorMilkPrice(selectedVendorId),
        notes: "",
      })
      setIsAddCollectionOpen(false)

      const vendor = vendors.find((v) => v.id === collectionData.vendor_id)
      toast({
        title: "Collection Added",
        description: `Collection for ${vendor?.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding collection:", error)
      toast({
        title: "Error",
        description: "Failed to add collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditCollection = async () => {
    if (
      !selectedCollection ||
      !newCollection.vendor_id ||
      !newCollection.collection_date ||
      !newCollection.quantity_liters ||
      !newCollection.price_per_liter
    )
      return

    // Validate date
    if (!validateDate(newCollection.collection_date as string)) return

    setSaving(true)
    try {
      const updates = {
        vendor_id: newCollection.vendor_id,
        collection_date: newCollection.collection_date,
        time_of_day: newCollection.time_of_day as "morning" | "day" | "evening",
        quantity_liters: Number(newCollection.quantity_liters),
        price_per_liter: Number(newCollection.price_per_liter),
        notes: newCollection.notes || "",
      }

      await milkCollectionOperations.update(selectedCollection.id, updates)
      await loadCollections()

      setNewCollection({
        vendor_id: "",
        collection_date: format(new Date(), "yyyy-MM-dd"),
        time_of_day: "morning",
        quantity_liters: 0,
        price_per_liter: defaultMilkPrice,
        notes: "",
      })
      setSelectedCollection(null)
      setIsEditCollectionOpen(false)

      const vendor = vendors.find((v) => v.id === updates.vendor_id)
      toast({
        title: "Collection Updated",
        description: `Collection for ${vendor?.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating collection:", error)
      toast({
        title: "Error",
        description: "Failed to update collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return

    try {
      await milkCollectionOperations.delete(selectedCollection.id)
      await loadCollections()

      const vendor = vendors.find((v) => v.id === selectedCollection.vendor_id)
      setSelectedCollection(null)
      setIsDeleteCollectionOpen(false)

      toast({
        title: "Collection Deleted",
        description: `Collection for ${vendor?.name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get vendor-specific milk price or use default
  const getVendorMilkPrice = (vendorId: string): number => {
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor?.milk_price_per_liter || defaultMilkPrice
  }

  // Handle vendor selection in collection form
  const handleVendorSelect = (vendorId: string) => {
    const vendorPrice = getVendorMilkPrice(vendorId)
    setNewCollection({
      ...newCollection,
      vendor_id: vendorId,
      price_per_liter: vendorPrice,
    })
  }

  if (loading) {
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
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Vendors & Collections</h1>
      </div>

      {/* Connection Status */}
      {!isSupabaseConfigured() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-400">
            <strong>Offline Mode:</strong> Using local storage. Connect to Supabase in Settings for real-time sync.
          </p>
        </div>
      )}

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
                          <TableCell>
                            {vendor.milk_price_per_liter?.toFixed(2) || defaultMilkPrice.toFixed(2)}
                          </TableCell>
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
                                    milk_price_per_liter: vendor.milk_price_per_liter,
                                    vendor_type: vendor.vendor_type,
                                  })
                                  setIsEditVendorOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 bg-transparent"
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
                        .sort((a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime())
                        .map((collection) => {
                          const vendor = vendors.find((v) => v.id === collection.vendor_id) || collection.vendors
                          return (
                            <TableRow key={collection.id}>
                              <TableCell>{format(new Date(collection.collection_date), "MMM dd, yyyy")}</TableCell>
                              <TableCell>
                                <span className="capitalize">{collection.time_of_day}</span>
                              </TableCell>
                              <TableCell className="font-medium">{vendor?.name || "Unknown"}</TableCell>
                              <TableCell>{collection.quantity_liters.toFixed(1)}</TableCell>
                              <TableCell>{collection.price_per_liter.toFixed(2)}</TableCell>
                              <TableCell>
                                {(collection.quantity_liters * collection.price_per_liter).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCollection(collection)
                                      setNewCollection({
                                        vendor_id: collection.vendor_id,
                                        collection_date: collection.collection_date,
                                        time_of_day: collection.time_of_day,
                                        quantity_liters: collection.quantity_liters,
                                        price_per_liter: collection.price_per_liter,
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
                                    className="text-red-500 hover:text-red-700 bg-transparent"
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
              <Label htmlFor="milk_price_per_liter" className="text-right">
                Milk Price (KSH)
              </Label>
              <Input
                id="milk_price_per_liter"
                type="number"
                step="0.01"
                value={newVendor.milk_price_per_liter}
                onChange={(e) => setNewVendor({ ...newVendor, milk_price_per_liter: Number(e.target.value) })}
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
            <Button onClick={handleAddVendor} disabled={!newVendor.name || !newVendor.phone || saving}>
              {saving ? "Adding..." : "Add Vendor"}
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
              <Label htmlFor="edit-milk_price_per_liter" className="text-right">
                Milk Price (KSH)
              </Label>
              <Input
                id="edit-milk_price_per_liter"
                type="number"
                step="0.01"
                value={newVendor.milk_price_per_liter}
                onChange={(e) => setNewVendor({ ...newVendor, milk_price_per_liter: Number(e.target.value) })}
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
            <Button onClick={handleEditVendor} disabled={!newVendor.name || !newVendor.phone || saving}>
              {saving ? "Updating..." : "Update Vendor"}
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
              <Select value={newCollection.vendor_id} onValueChange={handleVendorSelect}>
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
                value={newCollection.collection_date}
                onChange={(e) => {
                  setNewCollection({ ...newCollection, collection_date: e.target.value })
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
                value={newCollection.time_of_day}
                onValueChange={(value) =>
                  setNewCollection({ ...newCollection, time_of_day: value as "morning" | "day" | "evening" })
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
                value={newCollection.quantity_liters}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, quantity_liters: Number.parseFloat(e.target.value) })
                }
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
                value={newCollection.price_per_liter}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, price_per_liter: Number.parseFloat(e.target.value) })
                }
                className="col-span-3"
              />
              {newCollection.vendor_id && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Vendor's default price: KSH {getVendorMilkPrice(newCollection.vendor_id).toFixed(2)}
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
                !newCollection.vendor_id ||
                !newCollection.collection_date ||
                !newCollection.quantity_liters ||
                !newCollection.price_per_liter ||
                !!dateError ||
                saving
              }
            >
              {saving ? "Recording..." : "Record Collection"}
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
              <Select value={newCollection.vendor_id} onValueChange={handleVendorSelect}>
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
                value={newCollection.collection_date}
                onChange={(e) => {
                  setNewCollection({ ...newCollection, collection_date: e.target.value })
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
                value={newCollection.time_of_day}
                onValueChange={(value) =>
                  setNewCollection({ ...newCollection, time_of_day: value as "morning" | "day" | "evening" })
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
                value={newCollection.quantity_liters}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, quantity_liters: Number.parseFloat(e.target.value) })
                }
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
                value={newCollection.price_per_liter}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, price_per_liter: Number.parseFloat(e.target.value) })
                }
                className="col-span-3"
              />
              {newCollection.vendor_id && (
                <div className="col-span-3 col-start-2 text-sm text-gray-500">
                  Vendor's default price: KSH {getVendorMilkPrice(newCollection.vendor_id).toFixed(2)}
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
                !newCollection.vendor_id ||
                !newCollection.collection_date ||
                !newCollection.quantity_liters ||
                !newCollection.price_per_liter ||
                !!dateError ||
                saving
              }
            >
              {saving ? "Updating..." : "Update Collection"}
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
