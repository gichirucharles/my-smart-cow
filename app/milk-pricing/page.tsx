"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit } from "lucide-react"

export default function MilkPricingPage() {
  const [currentPrice, setCurrentPrice] = useState("50")

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Milk Pricing</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Price Record
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Milk Price</CardTitle>
            <CardDescription>Set and update the current milk price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="price">Price per Liter (KES)</Label>
                  <Input id="price" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
                </div>
                <Button>Update Price</Button>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                <p className="text-sm font-medium">Current Price: KES {currentPrice} per liter</p>
                <p className="text-xs text-gray-500">Last updated: Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>View historical milk prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <p className="font-medium">KES 50 per liter</p>
                  <p className="text-xs text-gray-500">From: Jan 1, 2023 - Present</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <p className="font-medium">KES 45 per liter</p>
                  <p className="text-xs text-gray-500">From: Jul 1, 2022 - Dec 31, 2022</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <p className="font-medium">KES 40 per liter</p>
                  <p className="text-xs text-gray-500">From: Jan 1, 2022 - Jun 30, 2022</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
