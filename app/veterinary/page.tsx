"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Plus } from "lucide-react"

export default function VeterinaryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Veterinary</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Visit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Visits</CardTitle>
            <CardDescription>Schedule and manage veterinary visits</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>View recent veterinary visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <p className="font-medium">Cow #1234</p>
                  <p className="text-sm text-gray-500">Vaccination</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Dr. Smith</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <p className="font-medium">Cow #5678</p>
                  <p className="text-sm text-gray-500">Health Check</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Dr. Johnson</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veterinarians</CardTitle>
            <CardDescription>Contact information for veterinarians</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">Dr. Smith</p>
                <p className="text-sm">Large Animal Specialist</p>
                <p className="text-sm text-gray-500">Phone: (123) 456-7890</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">Dr. Johnson</p>
                <p className="text-sm">Dairy Specialist</p>
                <p className="text-sm text-gray-500">Phone: (123) 456-7891</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
