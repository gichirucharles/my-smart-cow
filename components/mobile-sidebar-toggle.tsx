"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./sidebar"

export function MobileSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  )
}
