"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MilkIcon as Cow,
  FileText,
  Home,
  Menu,
  Milk,
  Settings,
  Users,
  X,
  HelpCircle,
  History,
  DollarSign,
  LogInIcon as Subscription,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { Copyright } from "@/components/copyright"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
  subItems?: { title: string; href: string }[]
  hidden?: boolean
  adminOnly?: boolean
}

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [inactiveUsers, setInactiveUsers] = useState<string[]>([])

  // Add this near the top of the Sidebar component function
  useEffect(() => {
    console.log("Sidebar: User admin status:", user?.isAdmin)
  }, [user])

  useEffect(() => {
    // Check for inactive users (those who haven't logged in for 30 days)
    if (user?.isAdmin) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const inactive = users
        .filter((u: any) => {
          const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null
          return lastLogin && lastLogin < thirtyDaysAgo
        })
        .map((u: any) => u.name)

      setInactiveUsers(inactive)
    }
  }, [user])

  // Fix the navItems array to include admin items directly below Reports
  // Replace the current navItems array with this updated version:

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Milk Production",
      href: "/production",
      icon: <Milk className="h-5 w-5" />,
    },
    {
      title: "Cow Management",
      href: "/cows",
      icon: <Cow className="h-5 w-5" />,
      subItems: [
        {
          title: "Cows",
          href: "/cows",
        },
        {
          title: "Calves",
          href: "/calves",
        },
        {
          title: "Vendors & Milk",
          href: "/vendors",
        },
      ],
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <DollarSign className="h-5 w-5" />,
      subItems: [
        {
          title: "General Expenses",
          href: "/expenses",
        },
      ],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText className="h-5 w-5" />,
    },
    // Admin items are now directly in the main navigation array, not in a separate array
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: <Users className="h-5 w-5" />,
      // This item is for admin users only
      adminOnly: true,
    },
    {
      title: "System Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      // This item is for admin users only
      adminOnly: true,
    },
    {
      title: "System Administration",
      href: "/settings/admin",
      icon: <Settings className="h-5 w-5" />,
      // This item is for admin users only
      adminOnly: true,
    },
    {
      title: "Subscription",
      href: "/subscription",
      icon: <Subscription className="h-5 w-5" />,
      subItems: [
        {
          title: "Plans & Pricing",
          href: "/pricing",
        },
        {
          title: "Manage Subscription",
          href: "/subscription",
        },
        {
          title: "Billing",
          href: "/subscription#billing",
        },
      ],
    },
    {
      title: "Payment History",
      href: "/payment-history",
      icon: <History className="h-5 w-5" />,
    },
  ]

  const bottomItems: NavItem[] = [
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      subItems: user?.isAdmin
        ? [
            {
              title: "User Settings",
              href: "/settings",
            },
            {
              title: "System Administration",
              href: "/settings/admin",
            },
          ]
        : undefined,
    },
    {
      title: "Support",
      href: "/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="flex items-center">
                <Cow className="mr-2 h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-semibold">Maziwa Smart</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="grid gap-1 px-2 py-4">
                {navItems.map((item) => {
                  // Skip admin-only items if user is not admin
                  if (item.adminOnly && !user?.isAdmin) {
                    return null
                  }

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
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
                      {item.subItems && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                                pathname === subItem.href
                                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                                  : "text-gray-600 dark:text-gray-400",
                              )}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </ScrollArea>
            <div className="border-t border-gray-200 dark:border-gray-800">
              <nav className="grid gap-1 px-2 py-4">
                {bottomItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                        pathname === item.href && !item.subItems
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                          : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                    {item.subItems && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                              pathname === subItem.href
                                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                                : "text-gray-600 dark:text-gray-400",
                            )}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                {user && (
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-50"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                  >
                    <X className="h-5 w-5" />
                    Logout
                  </Button>
                )}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-white dark:bg-gray-950 lg:flex",
          className,
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center">
            <Cow className="mr-2 h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-semibold">Maziwa Smart</h2>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid gap-1 px-2 py-4">
            {navItems.map((item) => {
              // Skip admin-only items if user is not admin
              if (item.adminOnly && !user?.isAdmin) {
                return null
              }

              return (
                <div key={item.href}>
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
                  {item.subItems && (
                    <div className="ml-6 mt-1 space-y-1">
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
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-gray-200 dark:border-gray-800">
          <nav className="grid gap-1 px-2 py-4">
            {bottomItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800/20 dark:hover:text-emerald-50",
                    pathname === item.href && !item.subItems
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-50"
                      : "text-gray-600 dark:text-gray-400",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
                {item.subItems && (
                  <div className="ml-6 mt-1 space-y-1">
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
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>
            {user && (
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-50"
                onClick={logout}
              >
                <X className="h-5 w-5" />
                Logout
              </Button>
            )}
          </nav>
        </div>

        {user?.isAdmin && inactiveUsers.length > 0 && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400 dark:text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Inactive Users Alert</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>The following users have been inactive for over 30 days: {inactiveUsers.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Copyright />
      </div>
    </>
  )
}
