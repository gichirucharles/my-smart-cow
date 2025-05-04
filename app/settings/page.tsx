"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Moon, Sun, Smartphone, FileText } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Types
interface AppSettings {
  currency: string
  language: string
  dateFormat: string
  farmName: string
  notifications: {
    milkProduction: boolean
    cowHealth: boolean
    expenses: boolean
    feedInventory: boolean
  }
  theme: "light" | "dark" | "system"
  mobileSettings: {
    dataUsage: "low" | "medium" | "high"
    offlineMode: boolean
  }
  reportSettings: {
    defaultFormat: "csv" | "json" | "pdf" | "excel"
    includeHeaders: boolean
    dateRange: "week" | "month" | "year" | "custom"
  }
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()

  const [settings, setSettings] = useState<AppSettings>({
    currency: "KSH",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    farmName: "My Smart Cow",
    notifications: {
      milkProduction: true,
      cowHealth: true,
      expenses: true,
      feedInventory: true,
    },
    theme: "system",
    mobileSettings: {
      dataUsage: "medium",
      offlineMode: false,
    },
    reportSettings: {
      defaultFormat: "csv",
      includeHeaders: true,
      dateRange: "month",
    },
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("appSettings")
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          setSettings({
            ...settings,
            ...parsedSettings,
            notifications: {
              ...settings.notifications,
              ...(parsedSettings.notifications || {}),
            },
            mobileSettings: {
              ...settings.mobileSettings,
              ...(parsedSettings.mobileSettings || {}),
            },
            reportSettings: {
              ...settings.reportSettings,
              ...(parsedSettings.reportSettings || {}),
            },
          })
        } catch (error) {
          console.error("Error parsing settings:", error)
        }
      }
    }
  }, [])

  // Update the saveSettings function to properly save settings and show a toast notification
  const saveSettings = () => {
    try {
      localStorage.setItem("appSettings", JSON.stringify(settings))

      // Log activity if user is logged in
      if (user) {
        const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
        const newLog = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          action: "Settings updated",
          details: "User updated application settings",
          timestamp: new Date().toISOString(),
        }

        localStorage.setItem("activityLogs", JSON.stringify([newLog, ...activityLogs]))
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setSettings({ ...settings, theme: newTheme })
    setTheme(newTheme)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Settings</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Customize your app experience</p>
        {/* Make sure the Button onClick handler is properly set up */}
        <Button
          onClick={saveSettings}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Save className="mr-2 h-4 w-4" /> Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  value={settings.farmName}
                  onChange={(e) => setSettings({ ...settings, farmName: e.target.value })}
                  placeholder="Enter your farm name"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This name will be displayed on your dashboard
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">Kenyan Shilling (KSH)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user && (
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">{user.name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/change-password">Change Password</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyMilkProduction">Milk Production Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about significant changes in milk production
                  </p>
                </div>
                <Switch
                  id="notifyMilkProduction"
                  checked={settings.notifications.milkProduction}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, milkProduction: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyCowHealth">Cow Health Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about cow health issues and upcoming vet visits
                  </p>
                </div>
                <Switch
                  id="notifyCowHealth"
                  checked={settings.notifications.cowHealth}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, cowHealth: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyExpenses">Expense Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about large expenses and budget thresholds
                  </p>
                </div>
                <Switch
                  id="notifyExpenses"
                  checked={settings.notifications.expenses}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, expenses: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyFeedInventory">Feed Inventory Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when feed inventory is running low
                  </p>
                </div>
                <Switch
                  id="notifyFeedInventory"
                  checked={settings.notifications.feedInventory}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, feedInventory: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <Button
                    variant={settings.theme === "light" ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-24 ${
                      settings.theme === "light"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400"
                        : ""
                    }`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="h-8 w-8 mb-2" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-24 ${
                      settings.theme === "dark"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400"
                        : ""
                    }`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-8 w-8 mb-2" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={settings.theme === "system" ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-24 ${
                      settings.theme === "system"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400"
                        : ""
                    }`}
                    onClick={() => handleThemeChange("system")}
                  >
                    <div className="flex mb-2">
                      <Sun className="h-8 w-8" />
                      <Moon className="h-8 w-8" />
                    </div>
                    <span>System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure how reports are generated and exported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Report Format</Label>
                  <RadioGroup
                    value={settings.reportSettings.defaultFormat}
                    onValueChange={(value: "csv" | "json" | "pdf" | "excel") =>
                      setSettings({
                        ...settings,
                        reportSettings: {
                          ...settings.reportSettings,
                          defaultFormat: value,
                        },
                      })
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        CSV (Comma Separated Values)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        JSON (JavaScript Object Notation)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        PDF (Portable Document Format)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Excel Spreadsheet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeHeaders">Include Headers</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Include column headers in exported reports
                    </p>
                  </div>
                  <Switch
                    id="includeHeaders"
                    checked={settings.reportSettings.includeHeaders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        reportSettings: { ...settings.reportSettings, includeHeaders: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDateRange">Default Date Range</Label>
                  <Select
                    value={settings.reportSettings.dateRange}
                    onValueChange={(value: "week" | "month" | "year" | "custom") =>
                      setSettings({
                        ...settings,
                        reportSettings: { ...settings.reportSettings, dateRange: value },
                      })
                    }
                  >
                    <SelectTrigger id="defaultDateRange">
                      <SelectValue placeholder="Select default date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="year">Last 12 Months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Settings</CardTitle>
              <CardDescription>Configure settings for mobile devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dataUsage">Data Usage</Label>
                <Select
                  value={settings.mobileSettings.dataUsage}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setSettings({
                      ...settings,
                      mobileSettings: { ...settings.mobileSettings, dataUsage: value },
                    })
                  }
                >
                  <SelectTrigger id="dataUsage">
                    <SelectValue placeholder="Select data usage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Save data)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Best quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offlineMode">Offline Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable offline functionality when internet is unavailable
                  </p>
                </div>
                <Switch
                  id="offlineMode"
                  checked={settings.mobileSettings.offlineMode}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      mobileSettings: { ...settings.mobileSettings, offlineMode: checked },
                    })
                  }
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-medium">Mobile App</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Download our mobile app for a better experience on your smartphone or tablet.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                    >
                      <path d="M17.9 2.318A5.32 5.32 0 0 1 22.8 7.6v8.8a5.32 5.32 0 0 1-4.9 5.282v-8.182l-6.3-3.6v11.782a5.32 5.32 0 0 1-4.9-5.282V7.6A5.32 5.32 0 0 1 11.6 2.318V10.5l6.3-3.6V2.318Zm-6.3 0a5.32 5.32 0 0 0-4.9 5.282 5.32 5.32 0 0 0 4.9 5.282V2.318Z" />
                    </svg>
                    Google Play
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                    >
                      <path d="M11.624 7.222c-.876 0-2.232-.996-3.66-.96-1.884.024-3.612 1.092-4.584 2.784-1.956 3.396-.504 8.412 1.404 11.172.936 1.344 2.04 2.856 3.504 2.808 1.404-.06 1.932-.912 3.636-.912 1.692 0 2.172.912 3.66.876 1.512-.024 2.472-1.368 3.396-2.724 1.068-1.56 1.512-3.072 1.536-3.156-.036-.012-2.94-1.128-2.976-4.488-.024-2.808 2.292-4.152 2.4-4.212-1.32-1.932-3.348-2.148-4.056-2.196-1.848-.144-3.396 1.008-4.26 1.008zm3.12-2.832c.78-.936 1.296-2.244 1.152-3.54-1.116.048-2.46.744-3.264 1.68-.72.828-1.344 2.16-1.176 3.42 1.236.096 2.508-.636 3.288-1.56z" />
                    </svg>
                    App Store
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
