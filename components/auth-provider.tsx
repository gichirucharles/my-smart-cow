"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js"
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  supabaseConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  supabase: SupabaseClient | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  // Initialize Supabase client
  useEffect(() => {
    const initializeSupabase = () => {
      try {
        const configured = isSupabaseConfigured()
        setSupabaseConfigured(configured)

        if (configured) {
          const config = getSupabaseConfig()
          if (config.url && config.key) {
            const client = createClient(config.url, config.key, {
              auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
              },
            })
            setSupabase(client)
            return client
          }
        }
        setSupabase(null)
        return null
      } catch (error) {
        console.error("Failed to initialize Supabase:", error)
        setSupabase(null)
        setSupabaseConfigured(false)
        return null
      }
    }

    const client = initializeSupabase()

    // Listen for configuration changes
    const handleConfigChange = () => {
      console.log("🔄 Supabase configuration changed, reinitializing...")
      initializeSupabase()
    }

    window.addEventListener("storage", handleConfigChange)
    window.addEventListener("supabase-config-updated", handleConfigChange)

    return () => {
      window.removeEventListener("storage", handleConfigChange)
      window.removeEventListener("supabase-config-updated", handleConfigChange)
    }
  }, [])

  // Handle auth state changes
  useEffect(() => {
    if (!supabase) {
      setUser(null)
      setSession(null)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Failed to get initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured")
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // The auth state change handler will update the user state
      return data
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) {
      throw new Error("Supabase not configured")
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error("Supabase not configured")
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    supabaseConfigured,
    signIn,
    signUp,
    signOut,
    supabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
