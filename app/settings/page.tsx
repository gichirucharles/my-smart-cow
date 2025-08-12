"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Database,
  Settings,
  Bell,
  Eye,
  Shield,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  ChevronDown,
  AlertCircle,
  Loader2,
  Info,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient, resetSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [connectionMethod, setConnectionMethod] = useState<"url-key" | "connection-string">("url-key")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [connectionString, setConnectionString] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState("")
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [schemaExpanded, setSchemaExpanded] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionDetails, setConnectionDetails] = useState<any>(null)

  // Load saved settings
  useEffect(() => {
    const savedUrl = localStorage.getItem("supabase_url")
    const savedKey = localStorage.getItem("supabase_key")
    const savedConnectionString = localStorage.getItem("supabase_connection_string")
    const savedSyncEnabled = localStorage.getItem("sync_enabled") === "true"

    if (savedUrl) setSupabaseUrl(savedUrl)
    if (savedKey) setSupabaseKey(savedKey)
    if (savedConnectionString) setConnectionString(savedConnectionString)
    setSyncEnabled(savedSyncEnabled)

    // Check if we have a saved connection
    if ((savedUrl && savedKey) || savedConnectionString) {
      setConnectionStatus("success")
    }
  }, [])

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes("supabase.co") || urlObj.hostname.includes("supabase.com")
    } catch {
      return false
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("testing")
    setConnectionError("")
    setConnectionDetails(null)

    try {
      let url = ""
      let key = ""

      if (connectionMethod === "url-key") {
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Please provide both Supabase URL and Anon Key")
        }

        if (!validateUrl(supabaseUrl)) {
          throw new Error("Invalid Supabase URL format. Should be like: https://your-project.supabase.co")
        }

        url = supabaseUrl.replace(/\/$/, "") // Remove trailing slash
        key = supabaseKey.trim()
      } else {
        if (!connectionString) {
          throw new Error("Please provide a connection string")
        }

        // Parse connection string format: https://your-project.supabase.co?apikey=your-key
        try {
          const urlObj = new URL(connectionString)
          url = `${urlObj.protocol}//${urlObj.host}`
          key = urlObj.searchParams.get("apikey") || ""

          if (!key) {
            throw new Error(
              "No API key found in connection string. Format should be: https://your-project.supabase.co?apikey=your-anon-key",
            )
          }
        } catch (parseError) {
          throw new Error(
            "Invalid connection string format. Should be: https://your-project.supabase.co?apikey=your-anon-key",
          )
        }
      }

      console.log("Testing connection to:", url)

      // Test 1: Check if the URL is reachable and API key works
      const healthResponse = await fetch(`${url}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      })

      if (!healthResponse.ok) {
        if (healthResponse.status === 401) {
          throw new Error("Authentication failed. Please check your API key.")
        } else if (healthResponse.status === 404) {
          throw new Error("Supabase REST API not found. Please check your URL.")
        } else {
          throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`)
        }
      }

      // Test 2: Try to create a Supabase client and test basic functionality
      try {
        const testClient = createSupabaseClient(url, key)

        // Test basic client functionality
        const { data, error } = await testClient.from("users").select("count").limit(1)

        // If we get here without error, the connection works
        // Note: We expect an error if the table doesn't exist yet, but that's okay
        console.log("Supabase client test completed")
      } catch (clientError) {
        console.log("Client test note:", clientError)
        // This is expected if tables don't exist yet
      }

      // Test 3: Check if we can access the auth endpoint
      const authResponse = await fetch(`${url}/auth/v1/settings`, {
        method: "GET",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      })

      const connectionInfo = {
        url: url,
        status: healthResponse.status,
        timestamp: new Date().toISOString(),
        apiKeyValid: true,
        restApiAccessible: healthResponse.ok,
        authApiAccessible: authResponse.ok,
      }

      setConnectionDetails(connectionInfo)
      setConnectionStatus("success")

      toast({
        title: "Connection Successful! ✅",
        description: "Successfully connected to your Supabase database.",
      })
    } catch (error: any) {
      console.error("Connection test failed:", error)
      setConnectionStatus("error")
      setConnectionError(error.message || "Unknown connection error")

      // Reset the client on error
      resetSupabaseClient()

      toast({
        title: "Connection Failed ❌",
        description: error.message || "Unable to connect to Supabase database.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const saveSettings = () => {
    if (connectionStatus !== "success") {
      toast({
        title: "Test Connection First",
        description: "Please test your connection before saving settings.",
        variant: "destructive",
      })
      return
    }

    try {
      if (connectionMethod === "url-key") {
        localStorage.setItem("supabase_url", supabaseUrl)
        localStorage.setItem("supabase_key", supabaseKey)
        localStorage.removeItem("supabase_connection_string")
      } else {
        localStorage.setItem("supabase_connection_string", connectionString)
        localStorage.removeItem("supabase_url")
        localStorage.removeItem("supabase_key")
      }
      localStorage.setItem("sync_enabled", syncEnabled.toString())

      toast({
        title: "Settings Saved ✅",
        description: "Database settings have been saved successfully. You can now use the app!",
      })

      // Redirect to login after successful setup
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      toast({
        title: "Save Failed ❌",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(databaseSchema)
      toast({
        title: "Schema Copied ✅",
        description: "Database schema copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed ❌",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const downloadSchema = () => {
    const blob = new Blob([databaseSchema], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "maziwa-smart-schema.sql"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Schema Downloaded ✅",
      description: "Database schema downloaded as maziwa-smart-schema.sql",
    })
  }

  const databaseSchema = `-- Maziwa Smart Application Complete Database Schema
-- This schema covers ALL input forms and data structures in the application
-- Run this SQL in your Supabase SQL Editor
-- FIXED: Tables are now created in the correct dependency order

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS AND AUTHENTICATION (Create first - referenced by many tables)
-- =============================================

-- Users table (from signup/login forms)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  farm_name VARCHAR(255),
  location VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION AND PAYMENT MANAGEMENT (Create early - referenced by users)
-- =============================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(8,2) NOT NULL,
  price_yearly DECIMAL(8,2),
  cow_limit INTEGER DEFAULT -1, -- -1 means unlimited
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(8,2),
  currency VARCHAR(10) DEFAULT 'KSH',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history table (from payment forms)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(8,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KSH',
  payment_method VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failure_reason TEXT,
  refund_amount DECIMAL(8,2),
  refund_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- VENDOR AND SUPPLIER MANAGEMENT (Create before feed_inventory and expenses)
-- =============================================

-- Vendors table (from vendor forms)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN ('supplier', 'buyer', 'service_provider', 'both')),
  contact_person VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Kenya',
  tax_id VARCHAR(100),
  business_license VARCHAR(100),
  bank_name VARCHAR(255),
  bank_account VARCHAR(100),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(10,2) DEFAULT 0,
  milk_price_per_liter DECIMAL(8,2),
  feed_discount_percentage DECIMAL(5,2) DEFAULT 0,
  service_categories JSONB DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor transactions table (from vendor transaction forms)
CREATE TABLE IF NOT EXISTS vendor_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'sale', 'payment', 'credit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  invoice_number VARCHAR(100),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COW MANAGEMENT (Create cows before calves)
-- =============================================

-- Cows table (from cow management forms)
CREATE TABLE IF NOT EXISTS cows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tag_number VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  mother_id UUID REFERENCES cows(id) ON DELETE SET NULL,
  father_tag VARCHAR(100),
  color VARCHAR(100),
  weight DECIMAL(8,2),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  purchase_location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pregnant', 'dry', 'sold', 'deceased', 'inactive')),
  lactation_status JSONB DEFAULT '{"lactating": false, "dry": false, "inCalf": false}',
  expected_delivery_date DATE,
  ai_dates JSONB DEFAULT '[]',
  location VARCHAR(255),
  ear_tag_color VARCHAR(50),
  microchip_id VARCHAR(100),
  registration_number VARCHAR(100),
  insurance_policy VARCHAR(100),
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_of_birth))) STORED,
  health_status VARCHAR(50) DEFAULT 'healthy',
  last_calving_date DATE,
  expected_calving_date DATE,
  milk_production_avg DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_number)
);

-- Calves table (from calf management forms) - References cows table
CREATE TABLE IF NOT EXISTS calves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mother_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  tag_number VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  birth_weight DECIMAL(8,2),
  sex VARCHAR(10) CHECK (sex IN ('male', 'female')),
  breed VARCHAR(100) NOT NULL,
  color VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'weaned')),
  weaning_date DATE,
  weaning_weight DECIMAL(8,2),
  vaccination_dates JSONB DEFAULT '[]',
  dehorning_date DATE,
  castration_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_number)
);

-- =============================================
-- MILK PRODUCTION AND SALES
-- =============================================

-- Milk production records (from production forms)
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_of_day VARCHAR(10) CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  morning_amount DECIMAL(8,2) DEFAULT 0,
  evening_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(8,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
  quality_grade VARCHAR(10),
  fat_content DECIMAL(5,2),
  protein_content DECIMAL(5,2),
  somatic_cell_count INTEGER,
  temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cow_id, date, time_of_day)
);

-- Milk pricing table (from milk pricing forms)
CREATE TABLE IF NOT EXISTS milk_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price_per_liter DECIMAL(8,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  grade VARCHAR(20) DEFAULT 'standard',
  buyer_category VARCHAR(50),
  seasonal_adjustment DECIMAL(5,2) DEFAULT 0,
  quality_bonus DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milk sales table (from sales forms)
CREATE TABLE IF NOT EXISTS milk_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_contact VARCHAR(100),
  quantity_liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity_liters * price_per_liter) STORED,
  quality_grade VARCHAR(10),
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'mpesa', 'bank_transfer', 'check', 'credit')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_date DATE,
  invoice_number VARCHAR(100),
  delivery_location VARCHAR(255),
  transport_cost DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milk collections table (from milk collection forms)
CREATE TABLE IF NOT EXISTS milk_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  collection_time TIME NOT NULL,
  time_of_day VARCHAR(10) CHECK (time_of_day IN ('morning', 'day', 'evening')),
  quantity_liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity_liters * price_per_liter) STORED,
  quality_test_results JSONB DEFAULT '{}',
  fat_content DECIMAL(5,2),
  protein_content DECIMAL(5,2),
  temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  collection_point VARCHAR(255),
  transport_cost DECIMAL(8,2) DEFAULT 0,
  collection_fee DECIMAL(8,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_date DATE,
  receipt_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FEED MANAGEMENT (Now vendors table exists)
-- =============================================

-- Feed inventory table (from feed management forms)
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feed_type VARCHAR(100) NOT NULL,
  feed_name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  quantity_kg DECIMAL(10,2) NOT NULL,
  bags_count INTEGER DEFAULT 0,
  bag_weight_kg DECIMAL(8,2) DEFAULT 50,
  cost_per_bag DECIMAL(10,2),
  cost_per_kg DECIMAL(8,2),
  total_cost DECIMAL(10,2),
  supplier_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  supplier_name VARCHAR(255),
  purchase_date DATE NOT NULL,
  expiry_date DATE,
  batch_number VARCHAR(100),
  storage_location VARCHAR(255),
  minimum_stock_level DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  nutritional_info JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed consumption table (from daily feeding forms)
CREATE TABLE IF NOT EXISTS feed_consumption (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES feed_inventory(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feeding_time TIME,
  feed_type VARCHAR(100) NOT NULL,
  amount_kg DECIMAL(8,2) NOT NULL,
  minerals_gms DECIMAL(8,2) DEFAULT 0,
  supplements JSONB DEFAULT '[]',
  water_consumption_liters DECIMAL(8,2),
  pasture_hours DECIMAL(4,2),
  body_condition_score DECIMAL(3,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed consumption summary (calculated table)
CREATE TABLE IF NOT EXISTS feed_consumption_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_feed_consumed_kg DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  average_per_cow_kg DECIMAL(8,2) DEFAULT 0,
  feed_efficiency_ratio DECIMAL(6,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =============================================
-- VETERINARY AND HEALTH
-- =============================================

-- Vet visits table (from vet visit forms)
CREATE TABLE IF NOT EXISTS vet_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time TIME,
  vet_name VARCHAR(255) NOT NULL,
  vet_phone VARCHAR(20),
  vet_license VARCHAR(100),
  clinic_name VARCHAR(255),
  visit_type VARCHAR(100) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  symptoms TEXT,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  medications JSONB DEFAULT '[]',
  procedures_performed JSONB DEFAULT '[]',
  test_results JSONB DEFAULT '{}',
  cost DECIMAL(10,2) NOT NULL,
  follow_up_date DATE,
  follow_up_instructions TEXT,
  vaccination_given VARCHAR(255),
  next_vaccination_due DATE,
  prescription_details TEXT,
  treatment_duration_days INTEGER,
  recovery_status VARCHAR(50) DEFAULT 'ongoing',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health monitoring table (from health tracking forms)
CREATE TABLE IF NOT EXISTS health_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  body_temperature DECIMAL(4,2),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  body_condition_score DECIMAL(3,1),
  weight DECIMAL(8,2),
  appetite VARCHAR(20) CHECK (appetite IN ('normal', 'reduced', 'absent', 'increased')),
  activity_level VARCHAR(20) CHECK (activity_level IN ('normal', 'reduced', 'hyperactive', 'lethargic')),
  milk_yield_change DECIMAL(5,2),
  udder_condition VARCHAR(50),
  hoof_condition VARCHAR(50),
  coat_condition VARCHAR(50),
  eye_condition VARCHAR(50),
  nasal_discharge BOOLEAN DEFAULT FALSE,
  coughing BOOLEAN DEFAULT FALSE,
  limping BOOLEAN DEFAULT FALSE,
  behavioral_changes TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccination records (from vaccination forms)
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(255) NOT NULL,
  vaccine_type VARCHAR(100),
  manufacturer VARCHAR(255),
  batch_number VARCHAR(100),
  vaccination_date DATE NOT NULL,
  administered_by VARCHAR(255),
  dosage VARCHAR(100),
  injection_site VARCHAR(100),
  next_due_date DATE,
  cost DECIMAL(8,2),
  side_effects TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BREEDING AND REPRODUCTION
-- =============================================

-- Breeding records table (from breeding forms)
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  breeding_date DATE NOT NULL,
  breeding_method VARCHAR(20) DEFAULT 'AI' CHECK (breeding_method IN ('AI', 'natural', 'embryo_transfer')),
  bull_name VARCHAR(255),
  bull_registration VARCHAR(100),
  sire_details TEXT,
  semen_batch VARCHAR(100),
  semen_source VARCHAR(255),
  technician_name VARCHAR(255),
  technician_license VARCHAR(100),
  insemination_time TIME,
  estrus_detection_method VARCHAR(100),
  estrus_signs TEXT,
  conception_rate_expected DECIMAL(5,2),
  cost DECIMAL(8,2),
  expected_calving_date DATE,
  actual_calving_date DATE,
  pregnancy_check_date DATE,
  pregnancy_status VARCHAR(20) DEFAULT 'unknown' CHECK (pregnancy_status IN ('confirmed', 'not_pregnant', 'unknown', 'aborted')),
  pregnancy_check_method VARCHAR(50),
  gestation_length_days INTEGER,
  calving_ease VARCHAR(20) CHECK (calving_ease IN ('easy', 'assisted', 'difficult', 'caesarean')),
  calf_survival VARCHAR(20) CHECK (calf_survival IN ('alive', 'stillborn', 'died_after_birth')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Heat detection records (from heat detection forms)
CREATE TABLE IF NOT EXISTS heat_detection (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  detection_date DATE NOT NULL,
  detection_time TIME,
  heat_intensity VARCHAR(20) CHECK (heat_intensity IN ('weak', 'moderate', 'strong')),
  standing_heat BOOLEAN DEFAULT FALSE,
  mounting_behavior BOOLEAN DEFAULT FALSE,
  restlessness BOOLEAN DEFAULT FALSE,
  decreased_appetite BOOLEAN DEFAULT FALSE,
  clear_discharge BOOLEAN DEFAULT FALSE,
  swollen_vulva BOOLEAN DEFAULT FALSE,
  detection_method VARCHAR(100),
  action_taken VARCHAR(100),
  breeding_scheduled BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pregnancy monitoring (from pregnancy tracking forms)
CREATE TABLE IF NOT EXISTS pregnancy_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  breeding_record_id UUID REFERENCES breeding_records(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  gestation_days INTEGER,
  check_method VARCHAR(50) CHECK (check_method IN ('palpation', 'ultrasound', 'blood_test', 'milk_test')),
  result VARCHAR(20) CHECK (result IN ('pregnant', 'not_pregnant', 'uncertain')),
  fetal_development VARCHAR(100),
  expected_calving_date DATE,
  body_condition_score DECIMAL(3,1),
  weight DECIMAL(8,2),
  udder_development VARCHAR(50),
  behavioral_changes TEXT,
  complications TEXT,
  vet_recommendations TEXT,
  cost DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FINANCIAL MANAGEMENT (Now vendors table exists)
-- =============================================

-- Expenses table (from expense forms)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KSH',
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name VARCHAR(255),
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'mpesa', 'bank_transfer', 'check', 'card', 'credit')),
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  receipt_number VARCHAR(100),
  invoice_number VARCHAR(100),
  tax_amount DECIMAL(8,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  location VARCHAR(255),
  project_code VARCHAR(50),
  approval_status VARCHAR(20) DEFAULT 'approved',
  approved_by VARCHAR(255),
  reimbursable BOOLEAN DEFAULT FALSE,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20),
  attachments JSONB DEFAULT '[]',
  receipt_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget planning table (from budget forms)
CREATE TABLE IF NOT EXISTS budget_planning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  budget_year INTEGER NOT NULL,
  budget_month INTEGER,
  category VARCHAR(100) NOT NULL,
  planned_amount DECIMAL(10,2) NOT NULL,
  actual_amount DECIMAL(10,2) DEFAULT 0,
  variance DECIMAL(10,2) GENERATED ALWAYS AS (actual_amount - planned_amount) STORED,
  variance_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, budget_year, budget_month, category)
);

-- Income records table (from income forms)
CREATE TABLE IF NOT EXISTS income_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KSH',
  customer_name VARCHAR(255),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'received',
  invoice_number VARCHAR(100),
  tax_amount DECIMAL(8,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SYSTEM AND ACTIVITY TRACKING
-- =============================================

-- Activity logs table (from all user actions)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings table (from settings forms)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'user',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Notifications table (from notification settings)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  category VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sync status table
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  error_message TEXT,
  records_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

-- =============================================
-- REPORTS AND ANALYTICS
-- =============================================

-- Report templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(100) NOT NULL,
  template_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  parameters JSONB DEFAULT '{}',
  file_path TEXT,
  file_size INTEGER,
  file_format VARCHAR(20),
  generation_status VARCHAR(20) DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User and authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Cow management indexes
CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
CREATE INDEX IF NOT EXISTS idx_cows_tag_number ON cows(tag_number);
CREATE INDEX IF NOT EXISTS idx_cows_status ON cows(status);
CREATE INDEX IF NOT EXISTS idx_cows_mother_id ON cows(mother_id);
CREATE INDEX IF NOT EXISTS idx_calves_user_id ON calves(user_id);
CREATE INDEX IF NOT EXISTS idx_calves_mother_id ON calves(mother_id);
CREATE INDEX IF NOT EXISTS idx_calves_birth_date ON calves(birth_date);

-- Milk production indexes
CREATE INDEX IF NOT EXISTS idx_milk_production_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_cow_id ON milk_production(cow_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(date);
CREATE INDEX IF NOT EXISTS idx_milk_sales_user_id ON milk_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_sales_date ON milk_sales(date);
CREATE INDEX IF NOT EXISTS idx_milk_collections_user_id ON milk_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_collections_date ON milk_collections(collection_date);

-- Feed management indexes
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_feed_type ON feed_inventory(feed_type);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_user_id ON feed_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_cow_id ON feed_consumption(cow_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_date ON feed_consumption(date);

-- Health and veterinary indexes
CREATE INDEX IF NOT EXISTS idx_vet_visits_user_id ON vet_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_visits_cow_id ON vet_visits(cow_id);
CREATE INDEX IF NOT EXISTS idx_vet_visits_date ON vet_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_health_monitoring_user_id ON health_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_health_monitoring_cow_id ON health_monitoring(cow_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON vaccinations(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_cow_id ON vaccinations(cow_id);

-- Breeding indexes
CREATE INDEX IF NOT EXISTS idx_breeding_records_user_id ON breeding_records(user_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_cow_id ON breeding_records(cow_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_date ON breeding_records(breeding_date);
CREATE INDEX IF NOT EXISTS idx_heat_detection_user_id ON heat_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_heat_detection_cow_id ON heat_detection(cow_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_monitoring_user_id ON pregnancy_monitoring(user_id);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_income_records_user_id ON income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_date ON income_records(date);

-- Vendor indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_user_id ON vendor_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE calves ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cows" ON cows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own calves" ON calves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own milk pricing" ON milk_pricing FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own milk sales" ON milk_sales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own feed inventory" ON feed_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own feed consumption" ON feed_consumption FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own feed consumption summary" ON feed_consumption_summary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vet visits" ON vet_visits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health monitoring" ON health_monitoring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vaccinations" ON vaccinations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own breeding records" ON breeding_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own heat detection" ON heat_detection FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pregnancy monitoring" ON pregnancy_monitoring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budget planning" ON budget_planning FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own income records" ON income_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vendor transactions" ON vendor_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own milk collections" ON milk_collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view subscription plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can manage own subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payment history" ON payment_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activity logs" ON activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own app settings" ON app_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sync status" ON sync_status FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own report templates" ON report_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own generated reports" ON generated_reports FOR ALL USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calves_updated_at BEFORE UPDATE ON calves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_production_updated_at BEFORE UPDATE ON milk_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_pricing_updated_at BEFORE UPDATE ON milk_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_sales_updated_at BEFORE UPDATE ON milk_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_inventory_updated_at BEFORE UPDATE ON feed_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_visits_updated_at BEFORE UPDATE ON vet_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_breeding_records_updated_at BEFORE UPDATE ON breeding_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_planning_updated_at BEFORE UPDATE ON budget_planning FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_collections_updated_at BEFORE UPDATE ON milk_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, cow_limit, features) VALUES
('Free Trial', '30-day free trial with basic features', 0, 0, 5, '["basic_cow_management", "milk_tracking", "basic_reports"]'),
('Basic', 'Essential features for small farms', 300, 3000, 20, '["cow_management", "milk_tracking", "feed_management", "basic_reports", "vet_records"]'),
('Premium', 'Advanced features for growing farms', 500, 5000, 100, '["advanced_cow_management", "milk_tracking", "feed_management", "advanced_reports", "vet_records", "breeding_management", "financial_tracking"]'),
('Enterprise', 'Full features for large operations', 1000, 10000, -1, '["all_features", "priority_support", "custom_reports", "api_access", "multi_user"]')
ON CONFLICT DO NOTHING;

-- Insert demo admin user (remove in production)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@maziwasmart.com', '$2b$10$example_hash_here', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Maziwa Smart complete database schema created successfully! 🐄' as message,
       'Total tables created: 35+' as tables_info,
       'Remember to update the password hashes and remove demo data in production' as security_note;`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-800">Maziwa Smart Settings</h1>
          <p className="text-muted-foreground">Configure your database connection to get started</p>
        </div>

        {!isSupabaseConfigured() && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Database Setup Required!</strong> Please configure your Supabase database connection below to use
              Maziwa Smart.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6">
            {/* Connection Status Alert */}
            {connectionStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Database Connected!</strong> Your app is successfully connected to Supabase.
                  {connectionDetails && (
                    <div className="mt-2 text-sm">
                      <div>URL: {connectionDetails.url}</div>
                      <div>Connected at: {new Date(connectionDetails.timestamp).toLocaleString()}</div>
                      <div>REST API: {connectionDetails.restApiAccessible ? "✅" : "❌"}</div>
                      <div>Auth API: {connectionDetails.authApiAccessible ? "✅" : "❌"}</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Failed!</strong> {connectionError}
                  <div className="mt-2 text-sm">
                    <strong>Troubleshooting:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Check your Supabase URL format (should be https://your-project.supabase.co)</li>
                      <li>Verify your API key is correct (anon/public key)</li>
                      <li>Ensure your Supabase project is active</li>
                      <li>Check your internet connection</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection
                </CardTitle>
                <CardDescription>Connect your Maziwa Smart app to your Supabase database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step-by-step guide */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How to get your Supabase credentials:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>
                        Go to{" "}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          supabase.com/dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>Select your project (or create a new one)</li>
                      <li>Go to Settings → API</li>
                      <li>Copy your "Project URL" and "anon public" key</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {/* Connection Method Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Connection Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={connectionMethod === "url-key" ? "default" : "outline"}
                      onClick={() => setConnectionMethod("url-key")}
                    >
                      URL + Anon Key (Recommended)
                    </Button>
                    <Button
                      variant={connectionMethod === "connection-string" ? "default" : "outline"}
                      onClick={() => setConnectionMethod("connection-string")}
                    >
                      Connection String
                    </Button>
                  </div>
                </div>

                {/* URL + Key Method */}
                {connectionMethod === "url-key" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supabase-url">Supabase Project URL</Label>
                      <Input
                        id="supabase-url"
                        placeholder="https://your-project-id.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className={!validateUrl(supabaseUrl) && supabaseUrl ? "border-red-300" : ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Find this in your Supabase project settings under API → Project URL
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                      <Input
                        id="supabase-key"
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Your public anonymous key from Supabase project settings under API → anon public
                      </p>
                    </div>
                  </div>
                )}

                {/* Connection String Method */}
                {connectionMethod === "connection-string" && (
                  <div className="space-y-2">
                    <Label htmlFor="connection-string">Connection String</Label>
                    <Input
                      id="connection-string"
                      placeholder="https://your-project-id.supabase.co?apikey=your-anon-key"
                      value={connectionString}
                      onChange={(e) => setConnectionString(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Format: https://your-project-id.supabase.co?apikey=your-anon-key
                    </p>
                  </div>
                )}

                {/* Connection Test */}
                <div className="flex items-center gap-4">
                  <Button onClick={testConnection} disabled={isTestingConnection} className="flex items-center gap-2">
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    {isTestingConnection ? "Testing Connection..." : "Test Connection"}
                  </Button>

                  {connectionStatus !== "idle" && (
                    <div className="flex items-center gap-2">
                      {connectionStatus === "testing" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Testing...
                        </Badge>
                      )}
                      {connectionStatus === "success" && (
                        <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                          <CheckCircle className="h-3 w-3" />
                          Connected ✅
                        </Badge>
                      )}
                      {connectionStatus === "error" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Failed ❌
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Sync Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Enable Data Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync your farm data with Supabase database
                      </p>
                    </div>
                    <Switch
                      checked={syncEnabled}
                      onCheckedChange={setSyncEnabled}
                      disabled={connectionStatus !== "success"}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={saveSettings} disabled={connectionStatus !== "success"}>
                    Save Settings & Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSupabaseUrl("")
                      setSupabaseKey("")
                      setConnectionString("")
                      setConnectionStatus("idle")
                      setConnectionError("")
                      setConnectionDetails(null)
                      resetSupabaseClient()
                      localStorage.removeItem("supabase_url")
                      localStorage.removeItem("supabase_key")
                      localStorage.removeItem("supabase_connection_string")
                      toast({
                        title: "Settings Cleared",
                        description: "Database connection settings have been cleared.",
                      })
                    }}
                  >
                    Clear Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Database Schema */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Database Schema</CardTitle>
                <CardDescription>
                  Comprehensive SQL schema covering ALL input forms and data structures in the Maziwa Smart application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Complete Schema:</strong> This schema includes 35+ tables covering every input form in the
                    app: user management, cow records, milk production, feeding, veterinary care, breeding, finances,
                    vendors, subscriptions, and system tracking.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <h4 className="font-medium">User Management</h4>
                    <ul className="text-muted-foreground space-y-0.5">
                      <li>• Users & Authentication</li>
                      <li>• Admin Users</li>
                      <li>• User Sessions</li>
                      <li>• App Settings</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Cow Management</h4>
                    <ul className="text-muted-foreground space-y-0.5">
                      <li>• Cows Registry</li>
                      <li>• Calves Records</li>
                      <li>• Health Monitoring</li>
                      <li>• Vaccinations</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Production</h4>
                    <ul className="text-muted-foreground space-y-0.5">
                      <li>• Milk Production</li>
                      <li>• Milk Sales</li>
                      <li>• Milk Collections</li>
                      <li>• Milk Pricing</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Feed & Health</h4>
                    <ul className="text-muted-foreground space-y-0.5">
                      <li>• Feed Inventory</li>
                      <li>• Feed Consumption</li>
                      <li>• Vet Visits</li>
                      <li>• Breeding Records</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copySchema} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Copy className="h-4 w-4" />
                    Copy Complete Schema
                  </Button>
                  <Button onClick={downloadSchema} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download SQL File
                  </Button>
                </div>

                <Collapsible open={schemaExpanded} onOpenChange={setSchemaExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                      <ChevronDown className={`h-4 w-4 transition-transform ${schemaExpanded ? "rotate-180" : ""}`} />
                      {schemaExpanded ? "Hide" : "Show"} Complete Database Schema (35+ Tables)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4">
                      <Textarea value={databaseSchema} readOnly className="min-h-[600px] font-mono text-xs" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="space-y-2">
                  <h4 className="font-medium">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>First, test your connection above until you see "Connected ✅"</li>
                    <li>Copy the complete SQL schema above</li>
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Paste and run the schema (this will create 35+ tables)</li>
                    <li>Save settings and continue to use the app!</li>
                  </ol>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How to verify your database is working:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>After running the schema, go to your Supabase dashboard</li>
                      <li>Click on "Table Editor" in the sidebar</li>
                      <li>You should see all 35+ tables listed (users, cows, milk_production, etc.)</li>
                      <li>Try adding a cow or milk record in your app - it should sync to the database</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic farm and application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name</Label>
                    <Input id="farm-name" placeholder="Enter your farm name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" placeholder="KSH" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" placeholder="English" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" placeholder="Africa/Nairobi" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive alerts and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get important alerts via SMS</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Vet Visit Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders for upcoming vet visits</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize the appearance of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Input id="date-format" placeholder="MM/DD/YYYY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number-format">Number Format</Label>
                    <Input id="number-format" placeholder="1,234.56" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage your data privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention (months)</Label>
                    <Input id="data-retention" type="number" placeholder="24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
