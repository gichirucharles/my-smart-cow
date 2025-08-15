"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Using Unicode symbols instead of lucide-react to avoid import issues
const icons = {
  home: "🏠",
  milk: "🥛",
  chart: "📊",
  cow: "🐄",
  baby: "🐣",
  feed: "🌾",
  medical: "🏥",
  calendar: "📅",
  building: "🏢",
  money: "💰",
  card: "💳",
  file: "📄",
  shield: "🛡️",
  user: "👤",
  settings: "⚙️",
  help: "❓",
  trend: "📈",
  chevron: "▼",
  logout: "🚪",
}

// Navigation data
const data = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: icons.home,
    },
    {
      title: "Milk Production",
      url: "/production",
      icon: icons.milk,
    },
    {
      title: "Reports & Analytics",
      url: "/reports",
      icon: icons.chart,
    },
  ],
  farmManagement: [
    {
      title: "Cow Management",
      url: "/cows",
      icon: icons.cow,
    },
    {
      title: "Calves",
      url: "/calves",
      icon: icons.baby,
    },
    {
      title: "Feed & Nutrition",
      url: "/feeds",
      icon: icons.feed,
    },
    {
      title: "Cow Feeding",
      url: "/cow-feeding",
      icon: icons.feed,
    },
    {
      title: "Veterinary",
      url: "/veterinary",
      icon: icons.medical,
    },
    {
      title: "Vet Visits",
      url: "/vet-visits",
      icon: icons.calendar,
    },
  ],
  business: [
    {
      title: "Vendors",
      url: "/vendors",
      icon: icons.building,
    },
    {
      title: "Milk Pricing",
      url: "/milk-pricing",
      icon: icons.money,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: icons.card,
    },
    {
      title: "Payment History",
      url: "/payment-history",
      icon: icons.file,
    },
  ],
  administration: [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: icons.shield,
    },
    {
      title: "User Management",
      url: "/settings/admin",
      icon: icons.user,
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: icons.settings,
    },
  ],
  support: [
    {
      title: "Settings",
      url: "/settings",
      icon: icons.settings,
    },
    {
      title: "Support",
      url: "/support",
      icon: icons.help,
    },
    {
      title: "Subscription",
      url: "/subscription",
      icon: icons.trend,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <span className="text-lg">{icons.milk}</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Maziwa Smart</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.farm_name || "Dairy Farm"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Farm Management */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
                Farm Management
                <span className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180">
                  {icons.chevron}
                </span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.farmManagement.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <span className="text-base">{item.icon}</span>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Business */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
                Business
                <span className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180">
                  {icons.chevron}
                </span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.business.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <span className="text-base">{item.icon}</span>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Administration - Only show for admins */}
        {user?.is_admin && (
          <Collapsible className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
                  Administration
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                  <span className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180">
                    {icons.chevron}
                  </span>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.administration.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                          <Link href={item.url}>
                            <span className="text-base">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-green-100 text-green-700">
                      {user?.full_name ? getInitials(user.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.full_name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <span className="ml-auto size-4">{icons.chevron}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <span className="mr-2">{icons.settings}</span>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/subscription" className="cursor-pointer">
                    <span className="mr-2">{icons.trend}</span>
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <span className="mr-2">{icons.logout}</span>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
