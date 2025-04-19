"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ArrowLeft,
  Users,
  MilkIcon as Cow,
  MilkIcon,
  Wheat,
  Stethoscope,
  User,
  Mail,
  Phone,
  CreditCard,
  Clock,
  Settings,
  Bell,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, differenceInDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
interface UserType {
  id: string
  name: string
  email: string
  phone: string
  isAdmin: boolean
  createdAt: string
  lastActive?: string
}

interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
}

interface PaymentRecord {
  userId: string
  userName: string
  userEmail: string
  planId: string
  planName: string
  amount: number
  date: string
  mpesaNumber: string
  transactionId: string
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCows: 0,
    totalMilkProduction: 0,
    totalFeedCost: 0,
    totalVetCost: 0,
  })
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [inactiveUsers, setInactiveUsers] = useState<UserType[]>([])
  const [userToRemove, setUserToRemove] = useState<UserType | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    enableNotifications: true,
    inactivityThreshold: 60, // days
    autoBackup: true,
    backupFrequency: "weekly",
    maintenanceMode: false,
  })

  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      router.push("/admin/login")
      return
    }

    // Load users from localStorage
    if (typeof window !== "undefined") {
      const savedUsersString = localStorage.getItem("users")
      if (savedUsersString) {
        try {
          const savedUsers = JSON.parse(savedUsersString)
          setUsers(savedUsers)

          // Check for inactive users (no activity in last 60 days after free trial)
          const now = new Date()
          const inactive = savedUsers.filter((u: UserType) => {
            if (!u.lastActive) return false
            const lastActive = new Date(u.lastActive)
            const createdAt = new Date(u.createdAt)

            // Add 30 days to createdAt for free trial period
            const freeTrialEnd = new Date(createdAt)
            freeTrialEnd.setDate(freeTrialEnd.getDate() + 30)

            // Only consider users whose free trial has ended
            if (now < freeTrialEnd) return false

            // Check if inactive for 60 days after free trial
            return lastActive < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          })
          setInactiveUsers(inactive)
        } catch (error) {
          console.error("Error parsing users from localStorage:", error)
        }
      }

      // Calculate stats
      const cows = JSON.parse(localStorage.getItem("cows") || "[]")
      const milkProductions = JSON.parse(localStorage.getItem("milkProductions") || "[]")
      const feeds = JSON.parse(localStorage.getItem("feeds") || "[]")
      const vetVisits = JSON.parse(localStorage.getItem("vetVisits") || "[]")
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]")

      setStats({
        totalUsers: savedUsers.length,
        totalCows: cows.length,
        totalMilkProduction: milkProductions.reduce((sum: number, p: any) => sum + p.amount, 0),
        totalFeedCost: feeds.reduce((sum: number, f: any) => sum + f.cost, 0),
        totalVetCost: vetVisits.reduce((sum: number, v: any) => sum + v.cost, 0),
      })

      // Load activity logs
      const savedLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
      setActivityLogs(savedLogs)

      // Load payment history
      const paymentHistory = JSON.parse(localStorage.getItem("paymentHistory") || "[]")
      setPayments(paymentHistory)

      // Load system settings
      const savedSettings = JSON.parse(localStorage.getItem("systemSettings") || "{}")
      if (Object.keys(savedSettings).length > 0) {
        setSystemSettings(savedSettings)
      }
    }
  }, [isAdmin, router])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleAdminStatus = (userId: string) => {
    const updatedUsers = users.map((user) => (user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log activity
    logActivity(
      userId,
      users.find((u) => u.id === userId)?.name || "Unknown",
      !users.find((u) => u.id === userId)?.isAdmin ? "Granted admin access" : "Removed admin access",
      `Admin status changed for user ${users.find((u) => u.id === userId)?.email || "Unknown"}`,
    )
  }

  const removeUser = (userId: string) => {
    const userToRemove = users.find((u) => u.id === userId)
    if (userToRemove) {
      setUserToRemove(userToRemove)
      setRemoveDialogOpen(true)
    }
  }

  const confirmRemoveUser = () => {
    if (!userToRemove) return

    const updatedUsers = users.filter((u) => u.id !== userToRemove.id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log activity
    logActivity(
      userToRemove.id,
      userToRemove.name,
      "User removed",
      `User ${userToRemove.email} was removed from the system`,
    )

    setUserToRemove(null)
    setRemoveDialogOpen(false)
  }

  const logActivity = (userId: string, userName: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    }

    const updatedLogs = [newLog, ...activityLogs].slice(0, 100) // Keep only last 100 logs
    setActivityLogs(updatedLogs)
    localStorage.setItem("activityLogs", JSON.stringify(updatedLogs))
  }

  const saveSystemSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(systemSettings))

    // Log activity
    logActivity(
      user?.id || "system",
      user?.name || "System",
      "System settings updated",
      "Administrator updated system settings",
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Registered users</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Cow className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Cows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCows}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total cows</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <MilkIcon className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Milk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMilkProduction.toFixed(1)} L</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total production</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Wheat className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Feed Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSH {stats.totalFeedCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total feed expenses</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Stethoscope className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Vet Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSH {stats.totalVetCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total vet expenses</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search users by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Phone</th>
                        <th className="text-left py-2">Joined</th>
                        <th className="text-left py-2">Last Active</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const lastActive = user.lastActive ? new Date(user.lastActive) : null
                        const daysSinceActive = lastActive ? differenceInDays(new Date(), lastActive) : null
                        const isInactive = daysSinceActive && daysSinceActive > 60

                        return (
                          <tr key={user.id} className="border-b">
                            <td className="py-2 flex items-center">
                              <User className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                              {user.name}
                            </td>
                            <td className="py-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                {user.email}
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                {user.phone || "Not provided"}
                              </div>
                            </td>
                            <td className="py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="py-2">
                              {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                            </td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  isInactive
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : user.isAdmin
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                }`}
                              >
                                {isInactive ? "Inactive" : user.isAdmin ? "Admin" : "Active"}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleAdminStatus(user.id)}
                                  className="text-xs"
                                >
                                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeUser(user.id)}
                                  className="text-xs text-red-500 border-red-500 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {inactiveUsers.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
                  <h3 className="font-medium flex items-center text-amber-800 dark:text-amber-400">
                    <Bell className="h-4 w-4 mr-2" />
                    Inactive Users Alert
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                    {inactiveUsers.length} user(s) have been inactive for more than 60 days after their free trial
                    period:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-500">
                    {inactiveUsers.map((user) => (
                      <li key={user.id}>
                        • {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-2">
                    Consider removing these users to maintain system performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track subscription payments from users</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CreditCard className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No payment records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">User</th>
                        <th className="text-left py-2">Plan</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Transaction ID</th>
                        <th className="text-left py-2">M-Pesa Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{format(new Date(payment.date), "MMM dd, yyyy")}</td>
                          <td className="py-2">
                            {payment.userName} ({payment.userEmail})
                          </td>
                          <td className="py-2">
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {payment.planName}
                            </Badge>
                          </td>
                          <td className="py-2">KSH {payment.amount.toLocaleString()}</td>
                          <td className="py-2">{payment.transactionId}</td>
                          <td className="py-2">{payment.mpesaNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent system activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No activity logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{log.action}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{log.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{log.userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">System Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable notifications for important system events
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={systemSettings.enableNotifications}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableNotifications: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactivityThreshold">User Inactivity Threshold (days)</Label>
                <Input
                  id="inactivityThreshold"
                  type="number"
                  value={systemSettings.inactivityThreshold}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, inactivityThreshold: Number.parseInt(e.target.value) || 60 })
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Number of days after which a user is considered inactive
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup system data</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                />
              </div>

              {systemSettings.autoBackup && (
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}
                  >
                    <SelectTrigger id="backupFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Put the system in maintenance mode (users will be unable to access the app)
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                />
              </div>

              <Button
                onClick={saveSystemSettings}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <Settings className="mr-2 h-4 w-4" /> Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userToRemove && (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {userToRemove.name}
                </p>
                <p>
                  <strong>Email:</strong> {userToRemove.email}
                </p>
                <p>
                  <strong>Joined:</strong> {new Date(userToRemove.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveUser}>
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
