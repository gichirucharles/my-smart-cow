"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MilkIcon as Cow, Droplets, Baby, CreditCard, FileText, Wheat } from 'lucide-react'
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const nav: NavItem[] = [
  { label: "Cow Management", href: "/cows", icon: FileText },
  { label: "Milk Records", href: "/production", icon: Droplets },
  { label: "Calves", href: "/calves", icon: Baby },
  // Removed "Vendors & Milk" as requested
  { label: "Feeding Monitor", href: "/cow-feeding", icon: Wheat },
  { label: "Subscriptions", href: "/subscription", icon: CreditCard },
]

export function SimplifiedSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Sidebar"
      className="w-64 h-screen border-r bg-white px-3 py-4 hidden md:flex flex-col"
    >
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Cow className="h-6 w-6 text-emerald-600" />
          <span className="font-semibold">Maziwa Smart</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-emerald-700" : "text-gray-500")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto px-2 text-xs text-gray-500">
        <p>v1.0 • Stay productive</p>
      </div>
    </aside>
  )
}

export default SimplifiedSidebar
