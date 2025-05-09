"use client"

import { Menu } from "lucide-react"
import { useState } from "react"
import { SimplifiedSidebar } from "./simplified-sidebar"

export function MobileSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
            <SimplifiedSidebar />
          </div>
        </>
      )}
    </>
  )
}
