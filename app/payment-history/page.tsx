"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"

interface PaymentRecord {
  userId: string
  userName: string
  userEmail: string
  planId: string
  planName: string
  amount: number
  date: string
  paymentMethod: string
  paymentDetails: string
  transactionId: string
  isUpgrade?: boolean
  isDowngrade?: boolean
}

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currencySymbol, setCurrencySymbol] = useState("KSH")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get payment history
      const paymentHistory = JSON.parse(localStorage.getItem("paymentHistory") || "[]")

      // Filter payments for current user only
      const userPayments = paymentHistory.filter((payment: PaymentRecord) => payment.userId === user?.id)

      setPayments(userPayments)
      setFilteredPayments(userPayments)

      // Get currency settings
      const settings = localStorage.getItem("appSettings")
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        if (parsedSettings.currency) {
          setCurrencySymbol(parsedSettings.currency)
        }
      }
    }
  }, [user])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter(
        (payment) =>
          payment.planName.toLowerCase().includes(term) ||
          payment.transactionId.toLowerCase().includes(term) ||
          payment.paymentMethod.toLowerCase().includes(term) ||
          new Date(payment.date)
            .toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
            .toLowerCase()
            .includes(term),
      )
      setFilteredPayments(filtered)
    }
  }

  const generateReceipt = (payment: PaymentRecord) => {
    // Create receipt content
    const receiptContent = `
SMART COW APP - PAYMENT RECEIPT
===============================
Transaction ID: ${payment.transactionId}
Date: ${new Date(payment.date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}
Time: ${new Date(payment.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}

Customer: ${payment.userName}
Email: ${payment.userEmail}

Plan: ${payment.planName}
Amount: ${currencySymbol} ${payment.amount.toLocaleString()}
Payment Method: ${payment.paymentMethod.toUpperCase()}

Thank you for your business!
For support, contact: support.mysmartcow.app@gmail.com
    `

    // Create a blob and download
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${payment.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Payment History</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Payment Records</CardTitle>
          <CardDescription>View and download receipts for all your subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Search Payments</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                id="search"
                placeholder="Search by plan, transaction ID, or date..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? "No payments match your search" : "No payment records found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{payment.planName} Plan</h3>
                      {payment.isUpgrade && <Badge className="bg-blue-500">Upgrade</Badge>}
                      {payment.isDowngrade && <Badge className="bg-amber-500">Downgrade</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Method:</span> {payment.paymentMethod}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-lg font-bold">
                      {currencySymbol} {payment.amount.toLocaleString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => generateReceipt(payment)}
                    >
                      <Download className="h-4 w-4" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
