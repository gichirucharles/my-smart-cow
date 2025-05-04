"use client"

import { useEffect, useState } from "react"
import { getSyncService, type SyncRecord } from "@/lib/sync-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, CloudOff, RefreshCw } from "lucide-react"

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [conflicts, setConflicts] = useState<SyncRecord[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const syncService = getSyncService()

    // Initial values
    setIsOnline(syncService.getOnlineStatus())
    setPendingChanges(syncService.getPendingChangesCount())
    setConflicts(syncService.getConflicts())

    // Listen for changes
    const unsubscribe = syncService.addConnectivityListener((status) => {
      setIsOnline(status)
      setPendingChanges(syncService.getPendingChangesCount())
      setConflicts(syncService.getConflicts())
    })

    // Update periodically
    const interval = setInterval(() => {
      setPendingChanges(syncService.getPendingChangesCount())
      setConflicts(syncService.getConflicts())
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const handleResolveConflict = (id: string, acceptLocal: boolean) => {
    const syncService = getSyncService()
    syncService.resolveConflict(id, acceptLocal)
    setConflicts(syncService.getConflicts())
  }

  if (isOnline && pendingChanges === 0 && conflicts.length === 0) {
    return null // Don't show anything if everything is synced
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              {isOnline ? (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Online
                </span>
              ) : (
                <span className="flex items-center">
                  <CloudOff className="h-4 w-4 text-amber-500 mr-2" />
                  Offline Mode
                </span>
              )}
            </CardTitle>
            {pendingChanges > 0 && (
              <Badge variant="outline" className="bg-amber-100">
                {pendingChanges} pending
              </Badge>
            )}
          </div>
          {!isOnline && (
            <CardDescription className="text-xs">Changes will sync when you're back online</CardDescription>
          )}
        </CardHeader>

        {(conflicts.length > 0 || (pendingChanges > 0 && showDetails)) && (
          <CardContent className="pb-2">
            {conflicts.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold mb-1 flex items-center">
                  <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                  Conflicts Detected
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="font-medium">
                        {conflict.entityType}: {conflict.id.substring(0, 8)}
                      </div>
                      <div className="flex justify-between mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleResolveConflict(conflict.id, true)}
                        >
                          Use Mine
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleResolveConflict(conflict.id, false)}
                        >
                          Use Server
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingChanges > 0 && showDetails && (
              <div>
                <h4 className="text-xs font-semibold mb-1 flex items-center">
                  <RefreshCw className="h-3 w-3 text-amber-500 mr-1" />
                  Pending Changes
                </h4>
                <p className="text-xs text-gray-500">{pendingChanges} changes will sync when online</p>
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className="pt-2">
          <div className="w-full flex justify-between">
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>

            {isOnline && pendingChanges > 0 && (
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  // Force sync attempt
                  const syncService = getSyncService()
                  // This would trigger a sync in a real implementation
                  setPendingChanges(syncService.getPendingChangesCount())
                }}
              >
                Sync Now
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
