"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Users,
  Settings,
  Shield,
  Database,
  Save,
  AlertTriangle,
  Trash2,
  RefreshCw,
  UserPlus,
  Edit,
  UserCheck,
  UserX,
  Download,
  Search,
  FileText,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  lastLogin?: string
  farmName?: string
}

interface ActivityLog {
  id: string
  userId?: string
  userName?: string
  action: string
  details: string
  timestamp: string
}

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  inactivityThreshold: number
  backupFrequency: "daily" | "weekly" | "monthly"
  sessionTimeout: number
  systemNotification?: string
  termsAndConditions?: string
}

export default function SystemAdminPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    inactivityThreshold: 30,
    backupFrequency: "weekly",
    sessionTimeout: 60,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
    isAdmin: false,
    isActive: true,
    farmName: "",
  })
  const [isConfirmBackupOpen, setIsConfirmBackupOpen] = useState(false)
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false)
  const [isConfirmClearLogsOpen, setIsConfirmClearLogsOpen] = useState(false)
  const [isConfirmClearDataOpen, setIsConfirmClearDataOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load users
      const savedUsers = localStorage.getItem("users")
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers))
      }

      // Load activity logs
      const savedLogs = localStorage.getItem("activityLogs")
      if (savedLogs) {
        setActivityLogs(JSON.parse(savedLogs))
      }

      // Load system settings
      const savedSettings = localStorage.getItem("appSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSystemSettings({
          maintenanceMode: parsedSettings.maintenanceMode || false,
          debugMode: parsedSettings.debugMode || false,
          inactivityThreshold: parsedSettings.inactivityThreshold || 30,
          backupFrequency: parsedSettings.backupFrequency || "weekly",
          sessionTimeout: parsedSettings.sessionTimeout || 60,
          systemNotification: parsedSettings.systemNotification || "",
          termsAndConditions: parsedSettings.termsAndConditions || "",
        })
      }

      setIsLoading(false)
    }
  }, [])

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Redirect non-admin users
      window.location.href = "/"
    }
  }, [user])

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || "",
      isAdmin: newUser.isAdmin || false,
      isActive: true,
      createdAt: new Date().toISOString(),
      farmName: newUser.farmName || "",
    }

    const updatedUsers = [...users, user]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setNewUser({
      name: "",
      email: "",
      phone: "",
      isAdmin: false,
      isActive: true,
      farmName: "",
    })
    setIsAddUserOpen(false)

    // Log activity
    logActivity("User Added", `Added user: ${user.name}`)

    toast({
      title: "User Added",
      description: `${user.name} has been added successfully.`,
    })
  }

  const handleEditUser = () => {
    if (!selectedUser || !newUser.name || !newUser.email) return

    const updatedUser: User = {
      ...selectedUser,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || "",
      isAdmin: newUser.isAdmin || false,
      isActive: newUser.isActive !== undefined ? newUser.isActive : selectedUser.isActive,
      farmName: newUser.farmName || "",
    }

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updatedUser : u))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setNewUser({
      name: "",
      email: "",
      phone: "",
      isAdmin: false,
      isActive: true,
      farmName: "",
    })
    setSelectedUser(null)
    setIsEditUserOpen(false)

    // Log activity
    logActivity("User Updated", `Updated user: ${updatedUser.name}`)

    toast({
      title: "User Updated",
      description: `${updatedUser.name} has been updated successfully.`,
    })
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return

    const updatedUsers = users.filter((u) => u.id !== selectedUser.id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log activity
    logActivity("User Deleted", `Deleted user: ${selectedUser.name}`)

    setSelectedUser(null)
    setIsDeleteUserOpen(false)

    toast({
      title: "User Deleted",
      description: `${selectedUser.name} has been deleted successfully.`,
    })
  }

  const handleToggleAdmin = (userId: string) => {
    const userToUpdate = users.find((u) => u.id === userId)
    if (!userToUpdate) return

    const updatedUser = { ...userToUpdate, isAdmin: !userToUpdate.isAdmin }
    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log activity
    logActivity(
      "Admin Status Changed",
      `${updatedUser.name} admin status changed to ${updatedUser.isAdmin ? "admin" : "non-admin"}`,
    )

    toast({
      title: "User Updated",
      description: `${updatedUser.name} is ${updatedUser.isAdmin ? "now an admin" : "no longer an admin"}.`,
    })
  }

  const handleToggleActive = (userId: string) => {
    const userToUpdate = users.find((u) => u.id === userId)
    if (!userToUpdate) return

    const updatedUser = { ...userToUpdate, isActive: !userToUpdate.isActive }
    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Log activity
    logActivity(
      "User Status Changed",
      `${updatedUser.name} status changed to ${updatedUser.isActive ? "active" : "inactive"}`,
    )

    toast({
      title: "User Updated",
      description: `${updatedUser.name} is ${updatedUser.isActive ? "now active" : "now inactive"}.`,
    })
  }

  const handleSaveSystemSettings = () => {
    // Get existing settings
    const existingSettings = JSON.parse(localStorage.getItem("appSettings") || "{}")

    // Update with new settings
    const updatedSettings = {
      ...existingSettings,
      ...systemSettings,
    }

    localStorage.setItem("appSettings", JSON.stringify(updatedSettings))

    // Log activity
    logActivity("System Settings Updated", "System settings were updated")

    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    })
  }

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: user?.id,
      userName: user?.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    }

    const updatedLogs = [newLog, ...activityLogs]
    setActivityLogs(updatedLogs)
    localStorage.setItem("activityLogs", JSON.stringify(updatedLogs))
  }

  const handleBackupDatabase = () => {
    setIsConfirmBackupOpen(false)

    // Create a backup of all localStorage data
    const backup = {
      timestamp: new Date().toISOString(),
      data: {},
    }

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        backup.data[key] = localStorage.getItem(key)
      }
    }

    // Convert to JSON and create download
    const backupJson = JSON.stringify(backup)
    const blob = new Blob([backupJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smart-cow-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Log activity
    logActivity("Database Backup", "Database backup was created and downloaded")

    toast({
      title: "Backup Created",
      description: "Database backup has been created and downloaded.",
    })
  }

  const handleRestoreDatabase = () => {
    setIsConfirmRestoreOpen(false)

    // Create file input element
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "application/json"
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target?.result as string)

          // Validate backup format
          if (!backup.timestamp || !backup.data) {
            throw new Error("Invalid backup format")
          }

          // Restore data
          Object.keys(backup.data).forEach((key) => {
            localStorage.setItem(key, backup.data[key])
          })

          // Log activity
          logActivity(
            "Database Restored",
            `Database restored from backup created on ${new Date(backup.timestamp).toLocaleString()}`,
          )

          toast({
            title: "Database Restored",
            description: "Database has been restored from backup.",
          })

          // Reload the page to reflect changes
          window.location.reload()
        } catch (error) {
          toast({
            title: "Restore Failed",
            description: "Failed to restore database from backup. Invalid backup file.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    fileInput.click()
  }

  const handleClearLogs = () => {
    setIsConfirmClearLogsOpen(false)
    setActivityLogs([])
    localStorage.setItem("activityLogs", JSON.stringify([]))

    // Add a new log for this action
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: user?.id,
      userName: user?.name,
      action: "Logs Cleared",
      details: "All activity logs were cleared",
      timestamp: new Date().toISOString(),
    }
    setActivityLogs([newLog])
    localStorage.setItem("activityLogs", JSON.stringify([newLog]))

    toast({
      title: "Logs Cleared",
      description: "All activity logs have been cleared.",
    })
  }

  const handleClearTestData = () => {
    setIsConfirmClearDataOpen(false)

    // Clear test data but keep users and settings
    const keysToKeep = ["users", "appSettings", "activityLogs", "currentUser"]
    const keysToRemove = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    // Log activity
    logActivity("Test Data Cleared", `Cleared ${keysToRemove.length} test data items`)

    toast({
      title: "Test Data Cleared",
      description: `${keysToRemove.length} test data items have been cleared.`,
    })
  }

  const handleExportLogs = () => {
    // Convert logs to CSV
    let csv = "ID,User ID,User Name,Action,Details,Timestamp\n"
    activityLogs.forEach((log) => {
      csv += `${log.id},${log.userId || ""},${log.userName || ""},"${log.action}","${log.details}",${log.timestamp}\n`
    })

    // Create download
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Log activity
    logActivity("Logs Exported", "Activity logs were exported to CSV")

    toast({
      title: "Logs Exported",
      description: "Activity logs have been exported to CSV.",
    })
  }

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">System Administration</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">System Administration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {users.filter((u) => u.isAdmin).length} admins
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter((u) => u.isActive).length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {users.filter((u) => !u.isActive).length} inactive
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activityLogs.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {activityLogs.length > 0
                ? `Last activity: ${new Date(activityLogs[0].timestamp).toLocaleDateString()}`
                : "No activity"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {systemSettings.maintenanceMode ? (
                <span className="text-amber-500">Maintenance</span>
              ) : (
                <span className="text-emerald-500">Online</span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {systemSettings.debugMode ? "Debug mode on" : "Production mode"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> Activity Logs
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> System Controls
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-1">
            <Database className="h-4 w-4" /> Database Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Users</CardTitle>
              <Button
                onClick={() => setIsAddUserOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>{user.farmName || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isAdmin ? "default" : "outline"}
                              className={user.isAdmin ? "bg-blue-500 hover:bg-blue-600" : ""}
                            >
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isActive ? "default" : "outline"}
                              className={
                                user.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "text-red-500 border-red-500"
                              }
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setNewUser({
                                    name: user.name,
                                    email: user.email,
                                    phone: user.phone || "",
                                    isAdmin: user.isAdmin,
                                    isActive: user.isActive,
                                    farmName: user.farmName || "",
                                  })
                                  setIsEditUserOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAdmin(user.id)}
                                className={user.isAdmin ? "text-blue-500" : ""}
                              >
                                {user.isAdmin ? <Shield className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleActive(user.id)}
                                className={!user.isActive ? "text-red-500" : ""}
                              >
                                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDeleteUserOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity Logs</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleExportLogs}>
                  <Download className="mr-2 h-4 w-4" /> Export Logs
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setIsConfirmClearLogsOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No activity logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.userName || "System"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Controls</CardTitle>
              <Button
                onClick={handleSaveSystemSettings}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      When enabled, only admins can access the system
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable detailed error messages and logging
                    </p>
                  </div>
                  <Switch
                    id="debug-mode"
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, debugMode: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-notification">System Notification</Label>
                  <Input
                    id="system-notification"
                    placeholder="Enter a system-wide notification message"
                    value={systemSettings.systemNotification || ""}
                    onChange={(e) => setSystemSettings({ ...systemSettings, systemNotification: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This message will be displayed to all users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inactivity-threshold">Inactivity Threshold (days)</Label>
                  <Input
                    id="inactivity-threshold"
                    type="number"
                    min="1"
                    max="365"
                    value={systemSettings.inactivityThreshold}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        inactivityThreshold: Number.parseInt(e.target.value) || 30,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Number of days after which a user is considered inactive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Automatic Backup Frequency</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setSystemSettings({ ...systemSettings, backupFrequency: value })
                    }
                  >
                    <SelectTrigger id="backup-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        sessionTimeout: Number.parseInt(e.target.value) || 60,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Time of inactivity after which users are automatically logged out
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Backup, restore, and manage your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Backup & Restore</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Create Backup</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Download a complete backup of all system data
                      </p>
                      <Button onClick={() => setIsConfirmBackupOpen(true)} className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Backup Database
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Restore from Backup</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Restore the system from a previous backup
                      </p>
                      <Button onClick={() => setIsConfirmRestoreOpen(true)} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Restore Database
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Clear Test Data</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Remove all test data while preserving user accounts and settings
                      </p>
                      <Button
                        onClick={() => setIsConfirmClearDataOpen(true)}
                        variant="outline"
                        className="w-full text-amber-600 border-amber-600 hover:bg-amber-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Test Data
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Database Statistics</h3>
                      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Storage Used:</span>
                          <span className="text-sm font-medium">
                            {Math.round(
                              Object.entries(localStorage).reduce(
                                (size, [key, value]) => size + (key.length + (value?.length || 0)) * 2,
                                0,
                              ) / 1024,
                            )}{" "}
                            KB
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Total Records:</span>
                          <span className="text-sm font-medium">{localStorage.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Last Backup:</span>
                          <span className="text-sm font-medium">Never</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="farmName" className="text-right">
                Farm Name
              </Label>
              <Input
                id="farmName"
                value={newUser.farmName}
                onChange={(e) => setNewUser({ ...newUser, farmName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAdmin" className="text-right">
                Admin
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isAdmin: checked === true })}
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">
                  Grant admin privileges
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name*
              </Label>
              <Input
                id="edit-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email*
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-farmName" className="text-right">
                Farm Name
              </Label>
              <Input
                id="edit-farmName"
                value={newUser.farmName}
                onChange={(e) => setNewUser({ ...newUser, farmName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isAdmin" className="text-right">
                Admin
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-isAdmin"
                  checked={newUser.isAdmin}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isAdmin: checked === true })}
                />
                <Label htmlFor="edit-isAdmin" className="cursor-pointer">
                  Grant admin privileges
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Status
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={newUser.isActive}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isActive: checked === true })}
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">
                  Active account
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={!newUser.name || !newUser.email}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Backup Dialog */}
      <Dialog open={isConfirmBackupOpen} onOpenChange={setIsConfirmBackupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Database</DialogTitle>
            <DialogDescription>
              This will create a backup of all system data. The backup will be downloaded as a JSON file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmBackupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBackupDatabase}>Create Backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Restore Dialog */}
      <Dialog open={isConfirmRestoreOpen} onOpenChange={setIsConfirmRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Database</DialogTitle>
            <DialogDescription>
              <AlertTriangle className="h-5 w-5 text-amber-500 inline-block mr-1" />
              Warning: This will replace all current data with the data from the backup file. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRestoreOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestoreDatabase}>
              Restore Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear Logs Dialog */}
      <Dialog open={isConfirmClearLogsOpen} onOpenChange={setIsConfirmClearLogsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Activity Logs</DialogTitle>
            <DialogDescription>
              <AlertTriangle className="h-5 w-5 text-amber-500 inline-block mr-1" />
              Are you sure you want to clear all activity logs? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmClearLogsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearLogs}>
              Clear Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear Test Data Dialog */}
      <Dialog open={isConfirmClearDataOpen} onOpenChange={setIsConfirmClearDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Test Data</DialogTitle>
            <DialogDescription>
              <AlertTriangle className="h-5 w-5 text-amber-500 inline-block mr-1" />
              This will remove all test data while preserving user accounts and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmClearDataOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearTestData}>
              Clear Test Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
