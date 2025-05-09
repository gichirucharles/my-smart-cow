"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface SystemSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
  defaultMilkPrice: number
  defaultFeedPrice: number
  backupFrequency: string
  notificationsEnabled: boolean
  inactivityThreshold: number
  termsAndConditions: string
}

export default function AdminSystemSettings() {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    maintenanceMessage: "The system is currently undergoing maintenance. Please try again later.",
    defaultMilkPrice: 50,
    defaultFeedPrice: 2000,
    backupFrequency: "daily",
    notificationsEnabled: true,
    inactivityThreshold: 30,
    termsAndConditions: "",
  })

  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      router.push("/")
      return
    }

    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("systemSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      // Get terms and conditions
      const termsContent = localStorage.getItem("termsAndConditions")
      if (termsContent) {
        setSettings((prev) => ({ ...prev, termsAndConditions: termsContent }))
      }
    }
  }, [user, router])

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("systemSettings", JSON.stringify(settings))

    // Save terms and conditions separately
    localStorage.setItem("termsAndConditions", settings.termsAndConditions)

    // Log activity
    const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
    activityLogs.unshift({
      id: Date.now().toString(),
      action: "System Settings Updated",
      details: "An administrator updated system settings",
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs))

    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode" className="text-base">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable maintenance mode to prevent users from accessing the system
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>

              {settings.maintenanceMode && (
                <div className="grid gap-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    placeholder="Enter message to display during maintenance"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="default-milk-price">Default Milk Price (KSH)</Label>
                <Input
                  id="default-milk-price"
                  type="number"
                  value={settings.defaultMilkPrice}
                  onChange={(e) => setSettings({ ...settings, defaultMilkPrice: Number(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="default-feed-price">Default Feed Price (KSH per bag)</Label>
                <Input
                  id="default-feed-price"
                  type="number"
                  value={settings.defaultFeedPrice}
                  onChange={(e) => setSettings({ ...settings, defaultFeedPrice: Number(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="backup-frequency">Automatic Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled" className="text-base">
                    System Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable or disable system-wide notifications
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inactivity-threshold">User Inactivity Threshold (days)</Label>
                <Input
                  id="inactivity-threshold"
                  type="number"
                  value={settings.inactivityThreshold}
                  onChange={(e) => setSettings({ ...settings, inactivityThreshold: Number(e.target.value) })}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Number of days after which a user is considered inactive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="terms-and-conditions">Edit Terms and Conditions</Label>
              <Textarea
                id="terms-and-conditions"
                value={settings.termsAndConditions}
                onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                placeholder="Enter the terms and conditions for your application"
                className="min-h-[300px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
