"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Edit, Trash2, DollarSign, Receipt } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Types
interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  customCategory?: string
}

export default function ExpensesPage() {
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [currency, setCurrency] = useState("KSH")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExpenses = localStorage.getItem("expenses")
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

      // Get currency from settings
      const appSettings = localStorage.getItem("appSettings")
      if (appSettings) {
        const settings = JSON.parse(appSettings)
        if (settings.currency) setCurrency(settings.currency)
      }
    }
  }, [])

  const handleSaveExpense = () => {
    if (!date || !(category || customCategory) || !amount) return

    const expenseCategory = category === "custom" ? customCategory : category

    if (editingExpense) {
      // Update existing expense
      const updatedExpenses = expenses.map((e) =>
        e.id === editingExpense.id
          ? {
              ...editingExpense,
              date,
              category: expenseCategory,
              customCategory: category === "custom" ? customCategory : undefined,
              description,
              amount: Number.parseFloat(amount),
              paymentMethod,
            }
          : e,
      )
      setExpenses(updatedExpenses)
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    } else {
      // Add new expense
      const expense: Expense = {
        id: Date.now().toString(),
        date,
        category: expenseCategory,
        customCategory: category === "custom" ? customCategory : undefined,
        description,
        amount: Number.parseFloat(amount),
        paymentMethod,
      }

      const updatedExpenses = [...expenses, expense]
      setExpenses(updatedExpenses)
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    }

    setCategory("")
    setCustomCategory("")
    setDescription("")
    setAmount("")
    setPaymentMethod("cash")
    setEditingExpense(null)
    setDialogOpen(false)
  }

  const handleDeleteExpense = () => {
    if (!expenseToDelete) return

    const updatedExpenses = expenses.filter((e) => e.id !== expenseToDelete)
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    setExpenseToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setDate(expense.date)

    // Check if the expense category is in our predefined list
    const predefinedCategories = [
      "Labor",
      "Feed",
      "Veterinary",
      "Equipment",
      "Utilities",
      "Maintenance",
      "Transport",
      "Insurance",
      "Taxes",
    ]

    if (predefinedCategories.includes(expense.category)) {
      setCategory(expense.category)
      setCustomCategory("")
    } else {
      setCategory("custom")
      setCustomCategory(expense.category)
    }

    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setPaymentMethod(expense.paymentMethod || "cash")
    setDialogOpen(true)
  }

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Prepare data for the chart - monthly expenses
  const monthlyExpenses: Record<string, number> = {}
  expenses.forEach((expense) => {
    const month = expense.date.substring(0, 7) // YYYY-MM
    if (!monthlyExpenses[month]) {
      monthlyExpenses[month] = 0
    }
    monthlyExpenses[month] += expense.amount
  })

  const chartData = Object.entries(monthlyExpenses)
    .map(([month, amount]) => ({
      month: format(new Date(month + "-01"), "MMM yyyy"),
      amount,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })

  // Prepare data for category breakdown
  const categoryExpenses: Record<string, number> = {}
  expenses.forEach((expense) => {
    if (!categoryExpenses[expense.category]) {
      categoryExpenses[expense.category] = 0
    }
    categoryExpenses[expense.category] += expense.amount
  })

  const categoryChartData = Object.entries(categoryExpenses)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Farm Expenses</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Track and manage all your farm expenses</p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <DollarSign className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currency} {totalExpenses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{expenses.length} expense records</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currency} {(monthlyExpenses[format(new Date(), "yyyy-MM")] || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {expenses.filter((e) => e.date.startsWith(format(new Date(), "yyyy-MM"))).length} expense records
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <>
                <div className="text-3xl font-bold">{categoryChartData[0].category}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currency} {categoryChartData[0].amount.toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No expense data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Receipt className="mx-auto h-12 w-12 opacity-30 mb-2" />
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                    <XAxis dataKey="month" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                    <YAxis
                      stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                      tickFormatter={(value) => `${currency} ${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f9fafb" : "#111827",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="amount" name={`Amount (${currency})`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Receipt className="mx-auto h-12 w-12 opacity-30 mb-2" />
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                    <XAxis
                      type="number"
                      stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                      tickFormatter={(value) => `${currency} ${value}`}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f9fafb" : "#111827",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="amount" name={`Amount (${currency})`} fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Receipt className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No expense records yet</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Amount ({currency})</th>
                    <th className="text-left py-2">Payment Method</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...expenses]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <tr key={expense.id} className="border-b">
                        <td className="py-2">{format(new Date(expense.date), "MMM dd, yyyy")}</td>
                        <td className="py-2">{expense.category}</td>
                        <td className="py-2">{expense.description}</td>
                        <td className="py-2">{expense.amount.toLocaleString()}</td>
                        <td className="py-2 capitalize">{expense.paymentMethod || "Cash"}</td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setExpenseToDelete(expense.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Veterinary">Veterinary</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Taxes">Taxes</SelectItem>
                  <SelectItem value="custom">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {category === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="customCategory">Custom Category</Label>
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount in ${currency}`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveExpense}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!date || !(category || customCategory) || !amount}
            >
              <Save className="mr-2 h-4 w-4" /> {editingExpense ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
