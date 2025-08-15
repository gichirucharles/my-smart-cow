"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { checkDatabaseSchema, testConnectionWithCredentials } from "@/lib/supabase-operations"
import { getSupabaseConfig, setSupabaseConfig, clearSupabaseConfig } from "@/lib/supabase"

export function SettingsContent() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "idle" | "testing" | "success" | "error"
    message: string
  }>({ status: "idle", message: "" })
  const [schemaStatus, setSchemaStatus] = useState<{
    status: "idle" | "checking" | "success" | "error"
    message: string
    details?: any
  }>({ status: "idle", message: "" })
  const [isSaving, setIsSaving] = useState(false)

  // Load existing configuration
  useEffect(() => {
    const config = getSupabaseConfig()
    if (config.url) setSupabaseUrl(config.url)
    if (config.key) setSupabaseKey(config.key)
  }, [])

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setConnectionStatus({
        status: "error",
        message: "Please enter both Supabase URL and API key",
      })
      return
    }

    setConnectionStatus({ status: "testing", message: "Testing connection..." })

    try {
      const result = await testConnectionWithCredentials(supabaseUrl, supabaseKey)

      if (result.success) {
        setConnectionStatus({
          status: "success",
          message: result.message,
        })
      } else {
        setConnectionStatus({
          status: "error",
          message: result.message,
        })
      }
    } catch (error: any) {
      setConnectionStatus({
        status: "error",
        message: error.message || "Connection test failed",
      })
    }
  }

  const handleCheckSchema = async () => {
    setSchemaStatus({ status: "checking", message: "Checking database schema..." })

    try {
      const result = await checkDatabaseSchema()

      if (result.success) {
        setSchemaStatus({
          status: "success",
          message: result.message,
        })
      } else {
        setSchemaStatus({
          status: "error",
          message: result.message,
          details: result,
        })
      }
    } catch (error: any) {
      setSchemaStatus({
        status: "error",
        message: error.message || "Schema check failed",
      })
    }
  }

  const handleSaveConfiguration = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setConnectionStatus({
        status: "error",
        message: "Please enter both Supabase URL and API key",
      })
      return
    }

    setIsSaving(true)

    try {
      // Test connection first
      const testResult = await testConnectionWithCredentials(supabaseUrl, supabaseKey)

      if (!testResult.success) {
        setConnectionStatus({
          status: "error",
          message: `Connection failed: ${testResult.message}`,
        })
        return
      }

      // Save configuration
      setSupabaseConfig(supabaseUrl, supabaseKey)

      setConnectionStatus({
        status: "success",
        message: "Configuration saved successfully! The app will now use your Supabase database.",
      })

      // Auto-check schema after successful save
      setTimeout(() => {
        handleCheckSchema()
      }, 1000)
    } catch (error: any) {
      setConnectionStatus({
        status: "error",
        message: error.message || "Failed to save configuration",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearConfiguration = () => {
    clearSupabaseConfig()
    setSupabaseUrl("")
    setSupabaseKey("")
    setConnectionStatus({ status: "idle", message: "" })
    setSchemaStatus({ status: "idle", message: "" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">✅ Success</Badge>
      case "error":
        return <Badge variant="destructive">❌ Error</Badge>
      case "testing":
      case "checking":
        return <Badge className="bg-blue-100 text-blue-800">🔄 Testing...</Badge>
      default:
        return <Badge variant="outline">⏳ Not tested</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Database Configuration</h2>
        <p className="text-green-600">Configure your Supabase database connection</p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test">Test Connection</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🔧 Supabase Configuration</CardTitle>
              <CardDescription>Enter your Supabase project details to connect your database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Supabase Project URL</Label>
                <Input
                  id="supabase-url"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                <Input
                  id="supabase-key"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveConfiguration}
                  disabled={isSaving || !supabaseUrl || !supabaseKey}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearConfiguration}
                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Connection Test
                {getStatusBadge(connectionStatus.status)}
              </CardTitle>
              <CardDescription>Test your database connection to ensure everything is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus.message && (
                <Alert
                  className={
                    connectionStatus.status === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                  }
                >
                  <AlertDescription className={connectionStatus.status === "error" ? "text-red-800" : "text-green-800"}>
                    {connectionStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleTestConnection}
                disabled={connectionStatus.status === "testing" || !supabaseUrl || !supabaseKey}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {connectionStatus.status === "testing" ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Testing Connection...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗄️ Database Schema
                {getStatusBadge(schemaStatus.status)}
              </CardTitle>
              <CardDescription>Verify that all required database tables and columns exist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schemaStatus.message && (
                <Alert
                  className={
                    schemaStatus.status === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                  }
                >
                  <AlertDescription className={schemaStatus.status === "error" ? "text-red-800" : "text-green-800"}>
                    <pre className="whitespace-pre-wrap text-sm">{schemaStatus.message}</pre>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCheckSchema}
                disabled={schemaStatus.status === "checking"}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {schemaStatus.status === "checking" ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Checking Schema...
                  </>
                ) : (
                  "Check Database Schema"
                )}
              </Button>

              {schemaStatus.status === "error" && schemaStatus.details?.needsSchema && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h4 className="font-medium text-amber-800 mb-2">📋 Next Steps:</h4>
                  <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Run the complete database schema script</li>
                    <li>Come back and click "Check Database Schema" again</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
