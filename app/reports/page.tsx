"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Milk, DollarSign, Heart, Wheat, BarChart, ClipboardList, Baby } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

// Mock Data - In a real app, this would come from your database
const mockMilkProductionData = [
  { date: "2023-01-01", cowId: "C001", morning: 10, evening: 8, total: 18 },
  { date: "2023-01-01", cowId: "C002", morning: 12, evening: 9, total: 21 },
  { date: "2023-01-02", cowId: "C001", morning: 11, evening: 9, total: 20 },
  { date: "2023-01-02", cowId: "C002", morning: 13, evening: 10, total: 23 },
]

const mockSalesData = [
  { date: "2023-01-05", customer: "John Doe", quantity: 50, pricePerLiter: 60, total: 3000 },
  { date: "2023-01-10", customer: "Jane Smith", quantity: 75, pricePerLiter: 58, total: 4350 },
]

const mockBreedingData = [
  { cowId: "C001", event: "AI", date: "2022-10-15", sire: "Bull A", result: "Pregnant" },
  { cowId: "C002", event: "Calving", date: "2023-07-20", calfId: "CALF001", sex: "Female" },
]

const mockHealthData = [
  {
    cowId: "C001",
    date: "2023-01-20",
    condition: "Mastitis",
    treatment: "Antibiotics",
    vetName: "Dr. Smith",
    followUpDate: "2023-01-27",
    notes: "Mild case, responding well.",
  },
  {
    cowId: "C002",
    date: "2023-02-10",
    condition: "Lameness",
    treatment: "Hoof trim",
    vetName: "Dr. Jones",
    followUpDate: "2023-02-17",
    notes: "Improved mobility.",
  },
  {
    cowId: "C001",
    date: "2023-03-01",
    condition: "Vaccination",
    treatment: "FMD Vaccine",
    vetName: "Dr. Smith",
    followUpDate: null,
    notes: "Annual vaccination.",
  },
]

const mockFeedData = [
  { date: "2023-01-01", cowId: "C001", feedType: "Concentrate", quantityKg: 5, cost: 150 },
  { date: "2023-01-01", cowId: "C002", feedType: "Hay", quantityKg: 10, cost: 100 },
]

const mockPerformanceData = [
  { cowId: "C001", lactationNumber: 1, peakYield: 25, daysInMilk: 150, averageYield: 20 },
  { cowId: "C002", lactationNumber: 2, peakYield: 30, daysInMilk: 180, averageYield: 22 },
]

const mockComplianceData = [
  { date: "2023-01-15", regulation: "Milk Quality Standards", status: "Compliant", notes: "All tests passed." },
  {
    date: "2023-02-01",
    regulation: "Animal Welfare Audit",
    status: "Non-Compliant",
    notes: "Minor issues with pen space.",
  },
]

// Column definitions for DataTable
const milkColumns = [
  { key: "date", title: "Date" },
  { key: "cowId", title: "Cow ID" },
  { key: "morning", title: "Morning (L)" },
  { key: "evening", title: "Evening (L)" },
  { key: "total", title: "Total (L)" },
]

const salesColumns = [
  { key: "date", title: "Date" },
  { key: "customer", title: "Customer" },
  { key: "quantity", title: "Quantity (L)" },
  { key: "pricePerLiter", title: "Price/L (KSH)" },
  { key: "total", title: "Total (KSH)" },
]

const breedingColumns = [
  { key: "cowId", title: "Cow ID" },
  { key: "event", title: "Event" },
  { key: "date", title: "Date" },
  { key: "sire", title: "Sire" },
  { key: "result", title: "Result" },
  { key: "calfId", title: "Calf ID" },
  { key: "sex", title: "Sex" },
]

const healthColumns = [
  { key: "cowId", title: "Cow ID" },
  { key: "date", title: "Date" },
  { key: "condition", title: "Condition" },
  { key: "treatment", title: "Treatment" },
  { key: "vetName", title: "Vet Name" },
  { key: "followUpDate", title: "Follow-up Date" },
  { key: "notes", title: "Notes" },
]

const feedColumns = [
  { key: "date", title: "Date" },
  { key: "cowId", title: "Cow ID" },
  { key: "feedType", title: "Feed Type" },
  { key: "quantityKg", title: "Quantity (Kg)" },
  { key: "cost", title: "Cost (KSH)" },
]

const performanceColumns = [
  { key: "cowId", title: "Cow ID" },
  { key: "lactationNumber", title: "Lactation #" },
  { key: "peakYield", title: "Peak Yield (L)" },
  { key: "daysInMilk", title: "Days in Milk" },
  { key: "averageYield", title: "Avg. Yield (L)" },
]

const complianceColumns = [
  { key: "date", title: "Date" },
  { key: "regulation", title: "Regulation" },
  { key: "status", title: "Status" },
  { key: "notes", title: "Notes" },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("milk")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const getReportDataAndColumns = (tab: string) => {
    switch (tab) {
      case "milk":
        return { data: mockMilkProductionData, columns: milkColumns }
      case "sales":
        return { data: mockSalesData, columns: salesColumns }
      case "breeding":
        return { data: mockBreedingData, columns: breedingColumns }
      case "health":
        return { data: mockHealthData, columns: healthColumns }
      case "feed":
        return { data: mockFeedData, columns: feedColumns }
      case "performance":
        return { data: mockPerformanceData, columns: performanceColumns }
      case "compliance":
        return { data: mockComplianceData, columns: complianceColumns }
      default:
        return { data: [], columns: [] }
    }
  }

  const { data, columns } = useMemo(() => getReportDataAndColumns(activeTab), [activeTab])

  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return data

    return data.filter((row: any) => {
      const rowDate = new Date(row.date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      if (start && rowDate < start) return false
      if (end && rowDate > end) return false
      return true
    })
  }, [data, startDate, endDate])

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`, 14, 22)

    const tableData = filteredData.map((row: any) =>
      columns.map((col: any) => {
        const value = row[col.key]
        return value !== null && value !== undefined ? String(value) : ""
      }),
    )
    const tableHeaders = columns.map((col: any) => col.title)
    ;(doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 30,
    })

    doc.save(`${activeTab}-report.pdf`)
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, activeTab.charAt(0).toUpperCase() + activeTab.slice(1))
    XLSX.writeFile(wb, `${activeTab}-report.xlsx`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Farm Reports</CardTitle>
          <CardDescription>Generate and view detailed reports for various farm activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto">
              <TabsTrigger value="milk">
                <Milk className="h-4 w-4 mr-2" /> Milk
              </TabsTrigger>
              <TabsTrigger value="sales">
                <DollarSign className="h-4 w-4 mr-2" /> Sales
              </TabsTrigger>
              <TabsTrigger value="breeding">
                <Baby className="h-4 w-4 mr-2" /> Breeding
              </TabsTrigger>
              <TabsTrigger value="health">
                <Heart className="h-4 w-4 mr-2" /> Health
              </TabsTrigger>
              <TabsTrigger value="feed">
                <Wheat className="h-4 w-4 mr-2" /> Feed
              </TabsTrigger>
              <TabsTrigger value="performance">
                <BarChart className="h-4 w-4 mr-2" /> Performance
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <ClipboardList className="h-4 w-4 mr-2" /> Compliance
              </TabsTrigger>
            </TabsList>

            {/* Date Range Filters and Export Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-[180px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-[180px]"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={exportToPDF} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" /> Export PDF
                </Button>
                <Button onClick={exportToExcel} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" /> Export Excel
                </Button>
              </div>
            </div>

            {/* Tab Contents */}
            <TabsContent value="milk">
              <DataTable
                data={filteredData}
                columns={milkColumns}
                searchable={true}
                searchKeys={["cowId", "date"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="sales">
              <DataTable
                data={filteredData}
                columns={salesColumns}
                searchable={true}
                searchKeys={["customer", "date"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="breeding">
              <DataTable
                data={filteredData}
                columns={breedingColumns}
                searchable={true}
                searchKeys={["cowId", "event"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="health">
              <DataTable
                data={filteredData}
                columns={healthColumns}
                searchable={true}
                searchKeys={["cowId", "condition", "vetName"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="feed">
              <DataTable
                data={filteredData}
                columns={feedColumns}
                searchable={true}
                searchKeys={["cowId", "feedType"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="performance">
              <DataTable
                data={filteredData}
                columns={performanceColumns}
                searchable={true}
                searchKeys={["cowId"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="compliance">
              <DataTable
                data={filteredData}
                columns={complianceColumns}
                searchable={true}
                searchKeys={["regulation", "status"]}
                pagination={true}
                pageSize={10}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
