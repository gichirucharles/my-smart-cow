"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Tag, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

// Types
interface MilkPrice {
  id: string
  date: string
  price: number
  notes?: string
  effectiveFrom: string
  effectiveTo?: string
}

export default function PricingPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [prices, setPrices] = useState<MilkPrice[]>([])
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [price, setPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [effectiveFrom, setEffectiveFrom] = useState(format(new Date(), "yyyy-MM-dd"))
  const [effectiveTo, setEffectiveTo] = useState("")
  const [editingPrice, setEditingPrice] = useState<MilkPrice | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [priceToDelete, setPriceToDelete] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [currency, setCurrency] = useState("KSH")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPrices = localStorage.getItem("milkPrices")
      if (savedPrices) {
        const parsedPrices = JSON.parse(savedPrices)
        setPrices(parsedPrices)

        // Find the current active price
        const today = new Date().toISOString().split("T")[0]
        const activePrice = parsedPrices.find(
          (p: MilkPrice) => p.effectiveFrom <= today && (!p.effectiveTo || p.effectiveTo >= today),
        )

        if (activePrice) {
          setCurrentPrice(activePrice.price)

          // Update global milk price in app settings
          const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
          settings.milkPrice = activePrice.price
          localStorage.setItem("appSettings", JSON.stringify(settings))
        }
      }

      // Set currency based on user's country
      if (user?.country) {
        if (user.country === "Kenya") setCurrency("KSH")
        else if (user.country === "Uganda") setCurrency("UGX")
        else if (user.country === "Tanzania") setCurrency("TZS")
        else if (user.country === "United States") setCurrency("USD")
        else if (user.country === "United Kingdom") setCurrency("GBP")
        else setCurrency("KSH") // Default
      }
    }
  }, [user])

  const handleSavePrice = () => {
    if (!date || !price || !effectiveFrom) return

    if (editingPrice) {
      // Update existing price
      const updatedPrices = prices.map((p) =>
        p.id === editingPrice.id
          ? {
              ...editingPrice,
              date,
              price: Number.parseFloat(price),
              notes,
              effectiveFrom,
              effectiveTo: effectiveTo || undefined,
            }
          : p,
      )
      setPrices(updatedPrices)
      localStorage.setItem("milkPrices", JSON.stringify(updatedPrices))
    } else {
      // Add new price
      const newPrice: MilkPrice = {
        id: Date.now().toString(),
        date,
        price: Number.parseFloat(price),
        notes,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined,
      }

      const updatedPrices = [...prices, newPrice]
      setPrices(updatedPrices)
      localStorage.setItem("milkPrices", JSON.stringify(updatedPrices))
    }

    // Update current price if this is now the active price
    const today = new Date().toISOString().split("T")[0]
    if (effectiveFrom <= today && (!effectiveTo || effectiveTo >= today)) {
      setCurrentPrice(Number.parseFloat(price))

      // Update global milk price in app settings
      const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
      settings.milkPrice = Number.parseFloat(price)
      localStorage.setItem("appSettings", JSON.stringify(settings))

      // Update default price in all vendor collections
      updateVendorCollectionPrices(Number.parseFloat(price))
    }

    setDate(format(new Date(), "yyyy-MM-dd"))
    setPrice("")
    setNotes("")
    setEffectiveFrom(format(new Date(), "yyyy-MM-dd"))
    setEffectiveTo("")
    setEditingPrice(null)
    setDialogOpen(false)

    toast({
      title: "Price Saved",
      description: "Milk price has been saved successfully.",
    })
  }

  const updateVendorCollectionPrices = (newPrice: number) => {
    // Update the default price for new vendor collections
    const collections = JSON.parse(localStorage.getItem("milkCollections") || "[]")

    // Only update collections without a specific price set
    const updatedCollections = collections.map((collection: any) => {
      // If the collection doesn't have a specific price set (price is 0 or not set)
      if (!collection.price || collection.price === 0) {
        return {
          ...collection,
          price: newPrice,
        }
      }
      return collection
    })

    localStorage.setItem("milkCollections", JSON.stringify(updatedCollections))

    toast({
      title: "Prices Updated",
      description: "Milk prices have been updated across the app.",
    })
  }

  const handleDeletePrice = () => {
    if (!priceToDelete) return

    const updatedPrices = prices.filter((p) => p.id !== priceToDelete)
    setPrices(updatedPrices)
    localStorage.setItem("milkPrices", JSON.stringify(updatedPrices))
    setPriceToDelete(null)
    setDeleteDialogOpen(false)

    // Recalculate current price
    const today = new Date().toISOString().split("T")[0]
    const activePrice = updatedPrices.find(
      (p) => p.effectiveFrom <= today && (!p.effectiveTo || p.effectiveTo >= today),
    )

    if (activePrice) {
      setCurrentPrice(activePrice.price)

      // Update global milk price in app settings
      const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
      settings.milkPrice = activePrice.price
      localStorage.setItem("appSettings", JSON.stringify(settings))
    } else {
      setCurrentPrice(null)
    }

    toast({
      title: "Price Deleted",
      description: "Milk price has been deleted successfully.",
    })
  }

  const handleEditPrice = (price: MilkPrice) => {
    setEditingPrice(price)
    setDate(price.date)
    setPrice(price.price.toString())
    setNotes(price.notes || "")
    setEffectiveFrom(price.effectiveFrom)
    setEffectiveTo(price.effectiveTo || "")
    setDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Milk Pricing</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Set and manage milk prices for your farm
          {currentPrice !== null && (
            <span className="ml-2 font-semibold">Current Price: KSH {currentPrice.toFixed(2)} per liter</span>
          )}
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Tag className="mr-2 h-4 w-4" /> Set New Price
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          {prices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Tag className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No price records yet</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Set First Price
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date Set</th>
                    <th className="text-left py-2">Price (KSH)</th>
                    <th className="text-left py-2">Effective From</th>
                    <th className="text-left py-2">Effective To</th>
                    <th className="text-left py-2">Notes</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...prices]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((price) => {
                      const today = new Date().toISOString().split("T")[0]
                      const isActive =
                        price.effectiveFrom <= today && (!price.effectiveTo || price.effectiveTo >= today)
                      const isFuture = price.effectiveFrom > today
                      const isPast = price.effectiveTo && price.effectiveTo < today

                      return (
                        <tr key={price.id} className="border-b">
                          <td className="py-2">{format(new Date(price.date), "MMM dd, yyyy")}</td>
                          <td className="py-2">{price.price.toFixed(2)}</td>
                          <td className="py-2">{format(new Date(price.effectiveFrom), "MMM dd, yyyy")}</td>
                          <td className="py-2">
                            {price.effectiveTo ? format(new Date(price.effectiveTo), "MMM dd, yyyy") : "Ongoing"}
                          </td>
                          <td className="py-2">{price.notes || "-"}</td>
                          <td className="py-2">
                            {isActive && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                              </span>
                            )}
                            {isFuture && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Future
                              </span>
                            )}
                            {isPast && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                Past
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditPrice(price)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setPriceToDelete(price.id)
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
            <DialogTitle>{editingPrice ? "Edit Price" : "Set New Price"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price per Liter (KSH)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price per liter"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
              <Input
                id="effectiveTo"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                placeholder="Leave blank if ongoing"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this price change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSavePrice}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!price || !effectiveFrom}
            >
              <Save className="mr-2 h-4 w-4" /> {editingPrice ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this price record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrice}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
