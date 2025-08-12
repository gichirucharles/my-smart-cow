"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { LoadingSpinner } from "./loading-spinner"

interface AuthUser extends User {
  is_admin?: boolean
  role?: string
  admin_permissions?: any
  phone_number?: string
  full_name?: string
  county?: string
  farm_name?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  supabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  // Get the appropriate Supabase client
  const getClient = () => {
    // Try default client first (from environment variables)
    if (supabase) {
      return supabase
    }
    // Fall back to settings-based client
    return getSupabaseClient()
  }

  useEffect(() => {
    // Check if Supabase is configured
    const checkConfiguration = () => {
      const hasEnvClient = !!supabase
      const hasSettingsClient = isSupabaseConfigured()
      const configured = hasEnvClient || hasSettingsClient

      setSupabaseConfigured(configured)

      if (!configured) {
        setLoading(false)
        return
      }

      initializeAuth()
    }

    const initializeAuth = async () => {
      const client = getClient()
      if (!client) {
        setLoading(false)
        return
      }

      try {
        // Get initial session
        const {
          data: { session },
        } = await client.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user, client)
        } else {
          setLoading(false)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await fetchUserProfile(session.user, client)
          } else {
            setUser(null)
            setLoading(false)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    checkConfiguration()

    // Listen for storage changes (when Supabase config is updated)
    const handleStorageChange = () => {
      checkConfiguration()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const fetchUserProfile = async (authUser: User, client = getClient()) => {
    if (!client) {
      setUser(authUser as AuthUser)
      setLoading(false)
      return
    }

    try {
      const { data: profile, error } = await client.from("users").select("*").eq("id", authUser.id).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        setUser(authUser as AuthUser)
      } else {
        setUser({ ...authUser, ...profile } as AuthUser)
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      setUser(authUser as AuthUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const client = getClient()
    if (!client) {
      throw new Error("Supabase is not configured. Please configure it in settings first.")
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Update last login
        await client.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id)

        await fetchUserProfile(data.user, client)
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const client = getClient()
    if (!client) {
      throw new Error("Supabase is not configured. Please configure it in settings first.")
    }

    try {
      // First check if we're hitting rate limits
      const { data: authData, error: authError } = await client.auth.signUp({
        email,
        password,
      })

      if (authError) {
        // Check if it's a rate limit error
        if (authError.message.includes("rate limit") || authError.message.includes("too many")) {
          // Add to waitlist instead
          const { error: waitlistError } = await client.from("waitlist").insert([
            {
              email,
              full_name: userData.full_name,
              phone_number: userData.phone_number,
              county: userData.county,
              farm_name: userData.farm_name,
              status: "pending",
            },
          ])

          if (waitlistError) throw waitlistError

          throw new Error(
            "Due to high demand, you have been added to our waitlist. We will notify you when your account is ready.",
          )
        }
        throw authError
      }

      if (authData.user) {
        // Create user profile with adaptive column detection
        const profileData: any = {
          id: authData.user.id,
          email,
          full_name: userData.full_name,
          county: userData.county,
          farm_name: userData.farm_name,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        }

        // Add phone_number if provided
        if (userData.phone_number) {
          profileData.phone_number = userData.phone_number
        }

        const { error: profileError } = await client.from("users").insert([profileData])

        if (profileError) {
          // If phone_number column doesn't exist, try without it
          if (profileError.message.includes("phone_number")) {
            const { phone_number, ...profileWithoutPhone } = profileData
            const { error: retryError } = await client.from("users").insert([profileWithoutPhone])

            if (retryError) throw retryError
          } else {
            throw profileError
          }
        }
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign up")
    }
  }

  const signOut = async () => {
    const client = getClient()
    if (!client) {
      throw new Error("Supabase is not configured")
    }

    const { error } = await client.auth.signOut()
    if (error) throw error
  }

  const isAdmin = user?.is_admin || false

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    supabaseConfigured,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
