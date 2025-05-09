"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Milk,
  Package,
  Stethoscope,
  Leaf,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  MilkIcon as Cow,
  Moon,
  Sun,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  subItems?: NavItem[]
  expanded?: boolean
}

export function SimplifiedSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("User")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get user name from localStorage if available
    try {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("currentUser")
        if (user) {
          const userData = JSON.parse(user)
          if (userData && userData.name) {
            setUserName(userData.name)
          }
          if (userData && userData.isAdmin) {
            setIsAdmin(true)
          }
        }
      }
    } catch (error) {
      console.error("Error getting user data:", error)
    }

    // Get theme preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark") {
        setTheme("dark")
      }
    }
  }, [])

  useEffect(() => {
    // Define navigation items with the new arrangement
    const items: NavItem[] = [
      {
        title: "Dashboard",
        href: "/",
        icon: <Home className="h-5 w-5" />,
      },
      {
        title: "Cow Management",
        href: "/cows",
        icon: <Cow className="h-5 w-5" />,
        subItems: [
          {
            title: "Vendors",
            href: "/vendors",
            icon: <ShoppingCart className="h-5 w-5" />,
          },
        ],
        expanded: pathname.startsWith("/cows") || pathname.startsWith("/vendors"),
      },
      {
        title: "Milk Production",
        href: "/production",
        icon: <Milk className="h-5 w-5" />,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: <DollarSign className="h-5 w-5" />,
        subItems: [
          {
            title: "Veterinary",
            href: "/veterinary",
            icon: <Stethoscope className="h-5 w-5" />,
          },
        ],
        expanded: pathname.startsWith("/expenses") || pathname.startsWith("/veterinary"),
      },
      {
        title: "Cow Feeding",
        href: "/cow-feeding",
        icon: <Package className="h-5 w-5" />,
      },
      {
        title: "Feeds & Concentrates",
        href: "/feeds",
        icon: <Leaf className="h-5 w-5" />,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: <FileText className="h-5 w-5" />,
      },
    ]

    if (isAdmin) {
      items.push({
        title: "Admin Dashboard",
        href: "/admin",
        icon: <Users className="h-5 w-5" />,
      })
    }

    setNavItems(items)
  }, [pathname, isAdmin])

  const toggleTheme = () => {
    if (typeof window === "undefined") return

    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleSubMenu = (index: number) => {
    setNavItems((prevItems) => {
      const newItems = [...prevItems]
      newItems[index] = {
        ...newItems[index],
        expanded: !newItems[index].expanded,
      }
      return newItems
    })
  }

  const bottomItems: NavItem[] = [
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-64 flex-col border-r bg-white dark:bg-gray-950 flex">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center">
          <Cow className="mr-2 h-6 w-6 text-emerald-600" />
          <h2 className="text-lg font-semibold">Maziwa Smart</h2>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-sm">Hello, {userName}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="grid gap-1 px-2 py-4">
          {navItems.map((item, index) => (
            <div key={item.href}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(index)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                      pathname === item.href || (item.expanded && item.subItems?.some((sub) => pathname === sub.href))
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                        : "text-gray-600 dark:text-gray-400",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.title}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-4 w-4 transition-transform ${item.expanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {item.expanded && item.subItems && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                            pathname === subItem.href
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                              : "text-gray-600 dark:text-gray-400",
                          )}
                        >
                          {subItem.icon}
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                    pathname === item.href
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                      : "text-gray-600 dark:text-gray-400",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Theme</span>
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        <nav className="grid gap-1 px-2 py-2">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                pathname === item.href
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-800">
        © {new Date().getFullYear()} Maziwa Smart
      </div>
    </div>
  )
}
