"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Home,
  Milk,
  BarChart2,
  Settings,
  LogOut,
  DollarSign,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  FileText,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  // Get user name
  let userName = "User"
  try {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const user = JSON.parse(userData)
      userName = user.name || "User"
    }
  } catch (error) {
    console.error("Error getting user data:", error)
  }

  // Navigation items
  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    {
      href: "/cows",
      label: "Cow Management",
      icon: <Milk className="h-5 w-5" />,
      subItems: [{ href: "/calves", label: "Calves" }],
    },
    { href: "/production", label: "Milk Production", icon: <Milk className="h-5 w-5" /> },
    {
      href: "/expenses",
      label: "Expenses",
      icon: <DollarSign className="h-5 w-5" />,
      subItems: [
        { href: "/feeds", label: "Feeds & Feeding" },
        { href: "/veterinary", label: "Veterinary" },
      ],
    },
    {
      href: "/vendors",
      label: "Vendors",
      icon: <ShoppingBag className="h-5 w-5" />,
      subItems: [{ href: "/milk-pricing", label: "Milk Pricing" }],
    },
    { href: "/reports", label: "Reports", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/subscription", label: "Subscription", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/payment-history", label: "Payment History", icon: <FileText className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { href: "/support", label: "Support", icon: <HelpCircle className="h-5 w-5" /> },
  ]

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <path
                fill="currentColor"
                d="M18.5 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75Zm2.25 2.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm-4.5 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-.75-.75ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm11.75 4.484c-.16-.293-.552-.398-.845-.238a5.5 5.5 0 0 1-5.61.141.75.75 0 0 0-.69 1.331 7 7 0 0 0 7.145-.234c.293-.16.398-.552.238-.845l-.238-.155ZM12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM4.25 12a7.75 7.75 0 1 1 15.5 0 7.75 7.75 0 0 1-15.5 0Z"
              />
            </svg>
            <h1 className="ml-2 text-xl font-bold">My Smart Cow</h1>
          </div>
          <div className="mt-2 text-center text-sm">
            <p className="font-medium">Hello, {userName}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>

                {/* Sub-items */}
                {item.subItems && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === subItem.href
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
