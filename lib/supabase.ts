import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

export function getSupabaseConfig() {
  if (typeof window === "undefined") {
    return { url: null, key: null }
  }

  return {
    url: localStorage.getItem("supabase_url"),
    key: localStorage.getItem("supabase_key"),
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig()
  return !!(url && key)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null
  }

  const { url, key } = getSupabaseConfig()

  if (!url || !key) {
    return null
  }

  // Create new client if config changed or client doesn't exist
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return null
    }
  }

  return supabaseClient
}

export function resetSupabaseClient() {
  supabaseClient = null
}

export function setSupabaseConfig(url: string, key: string) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("supabase_url", url)
  localStorage.setItem("supabase_key", key)

  // Reset client to use new config
  resetSupabaseClient()

  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent("supabase-config-updated"))
}

export function clearSupabaseConfig() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("supabase_url")
  localStorage.removeItem("supabase_key")

  // Reset client
  resetSupabaseClient()

  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent("supabase-config-updated"))
}
