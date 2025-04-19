"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: keyof T | string
    title: string
    render?: (row: T) => React.ReactNode
  }[]
  searchable?: boolean
  searchKeys?: (keyof T)[]
  pagination?: boolean
  pageSize?: number
}

export function DataTable<T>({
  data,
  columns,
  searchable = false,
  searchKeys = [],
  pagination = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search query
  const filteredData = searchable
    ? data.filter((row) => {
        if (!searchQuery) return true
        return searchKeys.some((key) => {
          const value = row[key]
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchQuery.toLowerCase())
          }
          if (typeof value === "number") {
            return value.toString().includes(searchQuery)
          }
          return false
        })
      })
    : data

  // Paginate data
  const totalPages = pagination ? Math.ceil(filteredData.length / pageSize) : 1
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key.toString()}>{column.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key.toString()}`}>
                      {column.render ? column.render(row) : row[column.key as keyof T]?.toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
