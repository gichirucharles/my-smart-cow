// A simplified sync service for demonstration purposes
// In a real app, this would be more complex

import { SecureStorage } from "./secure-storage"

// Interface for a pending change
interface PendingChange {
  id: string
  entityType: string
  data: any
  timestamp: number
  operation: "create" | "update" | "delete"
}

export interface SyncRecord {
  id: string
  entityType: string
}

// Simple in-memory queue for pending changes
let pendingChanges: PendingChange[] = []
let conflicts: SyncRecord[] = []

// Load pending changes from storage
const loadPendingChanges = () => {
  pendingChanges = SecureStorage.getItem("pendingChanges", [])
  conflicts = SecureStorage.getItem("conflicts", [])
}

// Save pending changes to storage
const savePendingChanges = () => {
  SecureStorage.setItem("pendingChanges", pendingChanges)
  SecureStorage.setItem("conflicts", conflicts)
}

// Initialize on import
loadPendingChanges()

// The sync service singleton
const syncService = {
  // Add a change to the queue
  queueChange: (change: PendingChange) => {
    pendingChanges.push(change)
    savePendingChanges()
  },

  // Get the number of pending changes
  getPendingChangesCount: () => {
    return pendingChanges.length
  },

  getConflicts: (): SyncRecord[] => {
    return conflicts
  },

  resolveConflict: (id: string, acceptLocal: boolean) => {
    conflicts = conflicts.filter((c) => c.id !== id)
    savePendingChanges()
  },

  getOnlineStatus: (): boolean => {
    return navigator.onLine
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
