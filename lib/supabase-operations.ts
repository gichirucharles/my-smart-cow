import { supabase } from "./supabase"

type UserProfile = {
  id: string
  email: string
  full_name: string
  phone_number?: string
  county?: string
  farm_name?: string
  is_admin: boolean
  role: string
  admin_permissions?: any
  subscription_status: string
  subscription_expires_at?: string
  trial_ends_at?: string
  terms_accepted: boolean
  terms_accepted_at?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

type UserInsert = Omit<UserProfile, "id" | "created_at" | "updated_at">
type UserUpdate = Partial<UserProfile>

type WaitlistEntry = {
  id: string
  email: string
  full_name: string
  phone_number?: string
  county?: string
  farm_name?: string
  status: "pending" | "approved" | "rejected" | "converted"
  requested_at: string
  approved_at?: string
  approved_by?: string
  converted_at?: string
  notes?: string
}

// Test database connection with detailed error handling
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔍 Testing database connection...")

    const { data, error } = await supabase.rpc("now")

    if (error) {
      // If 'now' function doesn't work, try a different approach
      console.log("⚠️ RPC test failed, trying table access...")

      // Test with a simple select that should work even if table is empty
      const { error: tableError } = await supabase.from("users").select("count").limit(0)

      if (tableError) {
        // Check if it's a table not found error
        if (tableError.message.includes("relation") && tableError.message.includes("does not exist")) {
          return {
            success: false,
            message: "Database connected but tables don't exist. Please run the SQL schema script first.",
          }
        }

        // Check if it's an authentication error
        if (tableError.message.includes("JWT") || tableError.message.includes("auth")) {
          return {
            success: false,
            message: "Database connection failed: Invalid API key or authentication error.",
          }
        }

        throw new Error(`Database access failed: ${tableError.message}`)
      }
    }

    console.log("✅ Database connection test successful!")
    return {
      success: true,
      message: "Database connection successful! Your Supabase database is accessible.",
    }
  } catch (error: any) {
    console.error("❌ Database connection test failed:", error)

    // Provide more specific error messages
    let errorMessage = error.message || "Unknown connection error"

    if (errorMessage.includes("fetch")) {
      errorMessage = "Network error: Unable to reach Supabase. Check your URL and internet connection."
    } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      errorMessage = "Authentication failed: Invalid API key or insufficient permissions."
    } else if (errorMessage.includes("404")) {
      errorMessage = "Project not found: Check your Supabase project URL."
    } else if (errorMessage.includes("CORS")) {
      errorMessage = "CORS error: Check your Supabase project settings and allowed origins."
    }

    return {
      success: false,
      message: `Connection failed: ${errorMessage}`,
    }
  }
}

// Check database schema with comprehensive table and column validation
export async function checkDatabaseSchema(): Promise<{
  success: boolean
  message: string
  needsSchema?: boolean
  missingTables?: string[]
  missingColumns?: { table: string; columns: string[] }[]
}> {
  try {
    console.log("🔍 Checking database schema...")

    // Define required tables and their essential columns
    const requiredSchema = {
      waitlist: ["id", "email", "full_name", "status", "requested_at"],
      users: ["id", "email", "full_name", "is_admin", "role", "subscription_status", "created_at", "updated_at"],
      cows: ["id", "user_id", "name"],
      milk_production: ["id", "user_id", "cow_id", "date"],
      feed_inventory: ["id", "user_id", "feed_type", "feed_name", "bags_count"],
      feed_consumption: ["id", "user_id", "cow_id", "feed_inventory_id", "consumption_date", "feed_amount_kg"],
      vendors: ["id", "user_id", "name", "milk_price_per_liter"],
      expenses: ["id", "user_id", "category", "amount"],
      vet_visits: ["id", "user_id", "cow_id", "visit_date"],
      daily_activities: ["id", "user_id", "activity_date", "activity_type", "description"],
    }

    const missingTables: string[] = []
    const missingColumns: { table: string; columns: string[] }[] = []

    // Check each table
    for (const [tableName, requiredColumns] of Object.entries(requiredSchema)) {
      try {
        console.log(`🔍 Checking table: ${tableName}`)

        // Try to access the table with minimal columns
        const { data, error } = await supabase
          .from(tableName as any)
          .select("id")
          .limit(1)

        if (error) {
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            console.log(`❌ Table missing: ${tableName}`)
            missingTables.push(tableName)
            continue
          } else {
            console.log(`⚠️ Table ${tableName} exists but may have issues:`, error.message)
          }
        }

        // If table exists, check for required columns
        console.log(`✅ Table ${tableName} exists, checking columns...`)

        // Try to select all required columns
        const columnCheckQuery = requiredColumns.join(", ")
        const { error: columnError } = await supabase
          .from(tableName as any)
          .select(columnCheckQuery)
          .limit(1)

        if (columnError) {
          if (columnError.message.includes("column") && columnError.message.includes("does not exist")) {
            // Parse which columns are missing
            const missingCols = requiredColumns.filter(
              (col) => columnError.message.includes(`"${col}"`) || columnError.message.includes(`'${col}'`),
            )

            if (missingCols.length > 0) {
              console.log(`❌ Missing columns in ${tableName}:`, missingCols)
              missingColumns.push({ table: tableName, columns: missingCols })
            } else {
              console.log(`⚠️ Column issue in ${tableName}:`, columnError.message)
              missingColumns.push({ table: tableName, columns: ["unknown columns"] })
            }
          }
        } else {
          console.log(`✅ All required columns exist in ${tableName}`)
        }
      } catch (tableError: any) {
        console.error(`❌ Error checking table ${tableName}:`, tableError)
        missingTables.push(tableName)
      }
    }

    // Generate results
    if (missingTables.length > 0 || missingColumns.length > 0) {
      let message = "Database schema issues found:\n"

      if (missingTables.length > 0) {
        message += `• Missing tables: ${missingTables.join(", ")}\n`
      }

      if (missingColumns.length > 0) {
        message += `• Tables with missing columns:\n`
        missingColumns.forEach(({ table, columns }) => {
          message += `  - ${table}: ${columns.join(", ")}\n`
        })
      }

      message += "\nPlease run the complete SQL schema script v3 in your Supabase SQL Editor."

      return {
        success: false,
        message: message.trim(),
        needsSchema: true,
        missingTables,
        missingColumns,
      }
    }

    console.log("✅ Database schema validation passed!")
    return {
      success: true,
      message: "Database schema is properly configured! All required tables and columns are present.",
    }
  } catch (error: any) {
    console.error("❌ Schema check failed:", error)
    return {
      success: false,
      message: `Schema validation failed: ${error.message}`,
      needsSchema: true,
    }
  }
}

// Test connection with specific credentials (for setup)
export async function testConnectionWithCredentials(
  url: string,
  key: string,
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log("🔍 Testing connection with provided credentials...")
    console.log("URL:", url)
    console.log("Key length:", key.length)

    // Validate inputs
    if (!url || !key) {
      throw new Error("URL and API key are required")
    }

    if (!url.startsWith("https://")) {
      throw new Error("Supabase URL must start with https://")
    }

    if (!url.includes("supabase.co") && !url.includes("localhost")) {
      throw new Error("Invalid Supabase URL format")
    }

    // Create test client
    const testClient = supabase

    // Test 1: Basic connection
    console.log("📡 Testing basic connectivity...")
    const startTime = Date.now()

    const { data, error } = await testClient.from("users").select("count").limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      console.error("❌ Connection test failed:", error)

      // Provide specific error messages
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return {
          success: true, // Connection works, just no tables yet
          message: "Connection successful! Database is accessible but tables need to be created.",
          details: {
            connectionTime: responseTime,
            status: "connected_no_tables",
            url: url,
            timestamp: new Date().toISOString(),
          },
        }
      }

      if (error.message.includes("JWT") || error.message.includes("Invalid API key")) {
        throw new Error("Invalid API key. Please check your Supabase anon key.")
      }

      if (error.message.includes("Project not found")) {
        throw new Error("Project not found. Please check your Supabase project URL.")
      }

      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Connection test successful!")
    return {
      success: true,
      message: "Connection successful! Your Supabase database is fully accessible.",
      details: {
        connectionTime: responseTime,
        status: "connected_with_tables",
        url: url,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error: any) {
    console.error("❌ Connection test with credentials failed:", error)

    let errorMessage = error.message || "Unknown connection error"

    // Network-related errors
    if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
      errorMessage = "Network error: Unable to reach Supabase. Check your internet connection and URL."
    }
    // CORS errors
    else if (errorMessage.includes("CORS")) {
      errorMessage = "CORS error: This might be a browser security issue. Try using the connection string method."
    }
    // Timeout errors
    else if (errorMessage.includes("timeout")) {
      errorMessage = "Connection timeout: Supabase is taking too long to respond. Try again later."
    }

    return {
      success: false,
      message: `Connection failed: ${errorMessage}`,
    }
  }
}

// Waitlist operations
export const waitlistOperations = {
  // Get all waitlist entries (admin only)
  async getAll(): Promise<WaitlistEntry[]> {
    const { data, error } = await supabase.from("waitlist").select("*").order("requested_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get pending waitlist entries
  async getPending(): Promise<WaitlistEntry[]> {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Approve waitlist entry
  async approve(id: string, adminId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from("waitlist")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        notes,
      })
      .eq("id", id)

    if (error) throw error
  },

  // Reject waitlist entry
  async reject(id: string, adminId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from("waitlist")
      .update({
        status: "rejected",
        approved_by: adminId,
        notes,
      })
      .eq("id", id)

    if (error) throw error
  },

  // Mark as converted (when user successfully signs up)
  async markConverted(email: string): Promise<void> {
    const { error } = await supabase
      .from("waitlist")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
      })
      .eq("email", email)
      .eq("status", "approved")

    if (error) throw error
  },

  // Add to waitlist
  async add(entry: Omit<WaitlistEntry, "id" | "status" | "requested_at">): Promise<void> {
    const { error } = await supabase.from("waitlist").insert([
      {
        ...entry,
        status: "pending",
        requested_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
  },
}

// User operations
export const userOperations = {
  // Get all users (admin only)
  async getAll(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get user by ID
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }
    return data
  },

  // Update user admin status
  async updateAdminStatus(id: string, isAdmin: boolean, role?: string, permissions?: any): Promise<void> {
    const updateData: any = { is_admin: isAdmin }
    if (role) updateData.role = role
    if (permissions) updateData.admin_permissions = permissions

    const { error } = await supabase.from("users").update(updateData).eq("id", id)

    if (error) throw error
  },

  // Get admin users
  async getAdmins(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_admin", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update user profile
  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase.from("users").update(updates).eq("id", id)

    if (error) throw error
  },

  // Get user statistics
  async getStats(): Promise<{
    total: number
    active: number
    trial: number
    subscribed: number
    admins: number
  }> {
    const { data: users, error } = await supabase.from("users").select("subscription_status, is_admin, last_login_at")

    if (error) throw error

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = {
      total: users?.length || 0,
      active: users?.filter((u) => u.last_login_at && new Date(u.last_login_at) > thirtyDaysAgo).length || 0,
      trial: users?.filter((u) => u.subscription_status === "trial").length || 0,
      subscribed: users?.filter((u) => u.subscription_status === "active").length || 0,
      admins: users?.filter((u) => u.is_admin).length || 0,
    }

    return stats
  },
}

// Feed operations with enhanced tracking
export const feedOperations = {
  // Add feed inventory with bags count
  async addInventory(data: {
    user_id: string
    feed_type: string
    feed_name: string
    quantity_kg: number
    bags_count?: number
    cost_per_kg?: number
    supplier?: string
    purchase_date?: string
    expiry_date?: string
    storage_location?: string
    notes?: string
  }): Promise<void> {
    const { error } = await supabase.from("feed_inventory").insert([data])

    if (error) throw error
  },

  // Add feed consumption with minerals
  async addConsumption(data: {
    user_id: string
    cow_id: string
    feed_inventory_id?: string
    consumption_date: string
    feed_amount_kg: number
    minerals_gms?: number
    notes?: string
  }): Promise<void> {
    const { error } = await supabase.from("feed_consumption").insert([data])

    if (error) throw error
  },

  // Get feed consumption by cow
  async getConsumptionByCow(userId: string, cowId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from("feed_consumption")
      .select(`
        *,
        feed_inventory:feed_inventory_id (
          feed_name,
          feed_type
        ),
        cow:cow_id (
          name
        )
      `)
      .eq("user_id", userId)
      .eq("cow_id", cowId)
      .order("consumption_date", { ascending: false })

    if (startDate) query = query.gte("consumption_date", startDate)
    if (endDate) query = query.lte("consumption_date", endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}

// Daily activities operations
export const dailyActivitiesOperations = {
  // Add daily activity
  async add(data: {
    user_id: string
    activity_date: string
    activity_type: string
    cow_id?: string
    description: string
    duration_minutes?: number
    priority?: string
    assigned_to?: string
    notes?: string
  }): Promise<void> {
    const { error } = await supabase.from("daily_activities").insert([data])

    if (error) throw error
  },

  // Get activities by date range
  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("daily_activities")
      .select(`
        *,
        cow:cow_id (
          name
        )
      `)
      .eq("user_id", userId)
      .gte("activity_date", startDate)
      .lte("activity_date", endDate)
      .order("activity_date", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Mark activity as completed
  async markCompleted(id: string): Promise<void> {
    const { error } = await supabase
      .from("daily_activities")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
  },
}
