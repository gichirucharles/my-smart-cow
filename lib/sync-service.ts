// A simplified sync service for demonstration purposes
// In a real app, this would be more complex

import { SecureStorage } from "./secure-storage"

// Interface for a pending change
interface PendingChange {
  id: string
  entity: string
  action: "create" | "update" | "delete"
  data: any
  timestamp: number
}

// Simple in-memory queue for pending changes
let pendingChanges: PendingChange[] = []

// Load pending changes from storage
const loadPendingChanges = () => {
  pendingChanges = SecureStorage.getItem("pendingChanges", [])
}

// Save pending changes to storage
const savePendingChanges = () => {
  SecureStorage.setItem("pendingChanges", pendingChanges)
}

// Initialize on import
loadPendingChanges()

// The sync service singleton
const syncService = {
  // Add a change to the queue
  queueChange: (entity: string, action: "create" | "update" | "delete", data: any) => {
    const change: PendingChange = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entity,
      action,
      data,
      timestamp: Date.now(),
    }

    pendingChanges.push(change)
    savePendingChanges()
    return change.id
  },

  // Get the number of pending changes
  getPendingChangesCount: () => {
    return pendingChanges.length
  },

  // Process the queue when online
  processQueue: async () => {
    if (!navigator.onLine || pendingChanges.length === 0) return

    console.log(`Processing ${pendingChanges.length} pending changes`)

    // In a real app, you would send these to your API
    // For demo, we'll just clear them after a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Clear the queue
    pendingChanges = []
    savePendingChanges()
  },

  // Add a listener for connectivity changes
  addConnectivityListener: (callback: (isOnline: boolean) => void) => {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Return function to remove listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  },
}

// Export a function to get the singleton
export const getSyncService = () => syncService
