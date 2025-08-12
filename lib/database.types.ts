export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          phone_number: string | null
          county: string | null
          farm_name: string | null
          is_admin: boolean
          role: string
          admin_permissions: Json | null
          subscription_status: string
          subscription_expires_at: string | null
          trial_ends_at: string | null
          terms_accepted: boolean
          terms_accepted_at: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          phone_number?: string | null
          county?: string | null
          farm_name?: string | null
          is_admin?: boolean
          role?: string
          admin_permissions?: Json | null
          subscription_status?: string
          subscription_expires_at?: string | null
          trial_ends_at?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          phone_number?: string | null
          county?: string | null
          farm_name?: string | null
          is_admin?: boolean
          role?: string
          admin_permissions?: Json | null
          subscription_status?: string
          subscription_expires_at?: string | null
          trial_ends_at?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          county: string | null
          farm_name: string | null
          status: string
          requested_at: string
          approved_at: string | null
          approved_by: string | null
          converted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone_number?: string | null
          county?: string | null
          farm_name?: string | null
          status?: string
          requested_at?: string
          approved_at?: string | null
          approved_by?: string | null
          converted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          county?: string | null
          farm_name?: string | null
          status?: string
          requested_at?: string
          approved_at?: string | null
          approved_by?: string | null
          converted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cows: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string | null
          age_months: number | null
          weight_kg: number | null
          health_status: string
          pregnancy_status: string
          last_calving_date: string | null
          expected_calving_date: string | null
          milk_yield_per_day: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed?: string | null
          age_months?: number | null
          weight_kg?: number | null
          health_status?: string
          pregnancy_status?: string
          last_calving_date?: string | null
          expected_calving_date?: string | null
          milk_yield_per_day?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string | null
          age_months?: number | null
          weight_kg?: number | null
          health_status?: string
          pregnancy_status?: string
          last_calving_date?: string | null
          expected_calving_date?: string | null
          milk_yield_per_day?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feed_inventory: {
        Row: {
          id: string
          user_id: string
          feed_type: string
          feed_name: string
          quantity_kg: number
          bags_count: number
          cost_per_kg: number | null
          supplier: string | null
          purchase_date: string | null
          expiry_date: string | null
          storage_location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feed_type: string
          feed_name: string
          quantity_kg?: number
          bags_count?: number
          cost_per_kg?: number | null
          supplier?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          storage_location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feed_type?: string
          feed_name?: string
          quantity_kg?: number
          bags_count?: number
          cost_per_kg?: number | null
          supplier?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          storage_location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feed_consumption: {
        Row: {
          id: string
          user_id: string
          cow_id: string
          feed_inventory_id: string | null
          consumption_date: string
          feed_amount_kg: number
          minerals_gms: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cow_id: string
          feed_inventory_id?: string | null
          consumption_date: string
          feed_amount_kg?: number
          minerals_gms?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cow_id?: string
          feed_inventory_id?: string | null
          consumption_date?: string
          feed_amount_kg?: number
          minerals_gms?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_activities: {
        Row: {
          id: string
          user_id: string
          activity_date: string
          activity_type: string
          cow_id: string | null
          description: string
          duration_minutes: number | null
          completed: boolean
          completed_at: string | null
          priority: string
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_date: string
          activity_type: string
          cow_id?: string | null
          description: string
          duration_minutes?: number | null
          completed?: boolean
          completed_at?: string | null
          priority?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_date?: string
          activity_type?: string
          cow_id?: string | null
          description?: string
          duration_minutes?: number | null
          completed?: boolean
          completed_at?: string | null
          priority?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
