"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MilkIcon as Cow,
  Droplets,
  Wheat,
  BarChart3,
  Home,
  Settings,
  UserCog,
  CreditCard,
  Baby,
  Stethoscope,
  Users,
  DollarSign,
  TrendingUp,
  HelpCircle,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Cow Management", href: "/cows", icon: Cow },
  { label: "Milk Records", href: "/production", icon: Droplets },
  { label: "Feeding Monitor", href: "/cow-feeding", icon: Wheat },
  { label: "Calves", href: "/calves", icon: Baby },
  { label: "Vet Visits", href: "/vet-visits", icon: Stethoscope },
  { label: "Veterinary", href: "/veterinary", icon: Stethoscope },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Vendors", href: "/vendors", icon: Users },
  { label: "Feeds", href: "/feeds", icon: Wheat },
  { label: "Expenses", href: "/expenses", icon: DollarSign },
  { label: "Milk Pricing", href: "/milk-pricing", icon: TrendingUp },
  { label: "Payment History", href: "/payment-history", icon: CreditCard },
  { label: "Support", href: "/support", icon: HelpCircle },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: UserCog },
  { label: "Subscription", href: "/subscription", icon: CreditCard }, // Added subscription link
]

const subscriptionPlans = [
  { name: "Bronze", cows: "Up to 3 cows", price: "KSH 150", color: "bg-amber-100 text-amber-800" },
  { name: "Silver", cows: "Up to 7 cows", price: "KSH 300", color: "bg-gray-100 text-gray-800" },
  { name: "Gold", cows: "Up to 15 cows", price: "KSH 500", color: "bg-yellow-100 text-yellow-800" },
  { name: "Diamond", cows: "16+ cows", price: "KSH 800", color: "bg-emerald-100 text-emerald-800" },
]

export function BasicSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Sidebar"
      className="hidden md:flex h-screen w-64 flex-col border-r bg-white/90 backdrop-blur dark:bg-gray-900/40 overflow-y-auto"
    >
      <div className="px-4 py-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Cow className="h-6 w-6 text-emerald-600" />
          <span className="font-semibold">Smart Cow</span>
        </Link>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn("h-5 w-5", active ? "text-emerald-700 dark:text-emerald-300" : "text-gray-500")}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Removed the static Subscription Section from BasicSidebar */}
      </nav>

      <div className="mt-auto px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t">
        <p>v1.0 — Reports added</p>
      </div>
    </aside>
  )
}
