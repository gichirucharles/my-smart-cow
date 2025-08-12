import { createClient } from "@supabase/supabase-js"

// Replace with optional environment variable support
let defaultSupabaseClient: ReturnType<typeof createClient> | null = null

// Try to create default client from environment variables if they exist
try {
  const envUrl = process.env.SUPABASE_SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY_ANON_KEY

  if (envUrl && envKey) {
    defaultSupabaseClient = createClient(envUrl, envKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
} catch (error) {
  console.log("No default Supabase environment variables found - will use settings configuration")
}

// Export the default client (can be null)
export const supabase = defaultSupabaseClient

// Helper function to check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("users").select("is_admin").eq("id", userId).single()

    if (error) return false
    return data?.is_admin || false
  } catch {
    return false
  }
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

let supabaseClient: ReturnType<typeof createClient> | null = null

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") return false

  const url = localStorage.getItem("supabase_url")
  const key = localStorage.getItem("supabase_key")

  return !!(url && key)
}

// Create Supabase client with provided credentials
export function createSupabaseClient(url: string, key: string) {
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

// Get or create Supabase client
export function getSupabaseClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient
  }

  // Only check localStorage on client side
  if (typeof window === "undefined") {
    return null
  }

  // Check if configuration exists
  if (!isSupabaseConfigured()) {
    console.log("⚠️ Supabase not configured")
    return null
  }

  try {
    const url = localStorage.getItem("supabase_url")!
    const key = localStorage.getItem("supabase_key")!

    console.log("🔄 Creating Supabase client...")
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    console.log("✅ Supabase client created successfully")
    return supabaseClient
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    return null
  }
}

// Reset client (useful when configuration changes)
export function resetSupabaseClient() {
  supabaseClient = null
  console.log("🔄 Supabase client reset")
}

// Save Supabase configuration
export function saveSupabaseConfig(url: string, key: string, connectionString?: string) {
  if (typeof window === "undefined") return

  localStorage.setItem("supabase_url", url)
  localStorage.setItem("supabase_key", key)

  if (connectionString) {
    localStorage.setItem("supabase_connection_string", connectionString)
  }

  // Reset client to force recreation with new config
  resetSupabaseClient()

  console.log("✅ Supabase configuration saved")
}

// Get saved configuration
export function getSupabaseConfig() {
  if (typeof window === "undefined") {
    return { url: null, key: null, connectionString: null }
  }

  return {
    url: localStorage.getItem("supabase_url"),
    key: localStorage.getItem("supabase_key"),
    connectionString: localStorage.getItem("supabase_connection_string"),
  }
}

// Clear configuration
export function clearSupabaseConfig() {
  if (typeof window === "undefined") return

  localStorage.removeItem("supabase_url")
  localStorage.removeItem("supabase_key")
  localStorage.removeItem("supabase_connection_string")

  resetSupabaseClient()

  console.log("🗑️ Supabase configuration cleared")
}
