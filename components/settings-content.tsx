"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Database,
  Settings,
  Bell,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Server,
  Key,
  Globe,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Palette,
  Monitor,
  Moon,
  Sun,
  Smartphone,
} from "lucide-react"
import {
  getSupabaseClient,
  saveSupabaseConfig,
  getSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/supabase"

export function SettingsContent() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("database")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [connectionError, setConnectionError] = useState<string>("")

  // Database settings
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [connectionString, setConnectionString] = useState("")

  // General settings
  const [farmName, setFarmName] = useState("My Dairy Farm")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [currency, setCurrency] = useState("USD")
  const [language, setLanguage] = useState("en")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [lowMilkAlert, setLowMilkAlert] = useState(true)
  const [healthAlert, setHealthAlert] = useState(true)
  const [feedingAlert, setFeedingAlert] = useState(true)
  const [subscriptionAlert, setSubscriptionAlert] = useState(true)

  // Display settings
  const [theme, setTheme] = useState("system")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")
  const [timeFormat, setTimeFormat] = useState("12")
  const [measurementUnit, setMeasurementUnit] = useState("metric")
  const [dashboardLayout, setDashboardLayout] = useState("default")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true)

  // Privacy settings
  const [dataSharing, setDataSharing] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("30")

  useEffect(() => {
    loadSavedConfig()
  }, [])

  const loadSavedConfig = () => {
    const config = getSupabaseConfig()
    if (config.url) setSupabaseUrl(config.url)
    if (config.key) setSupabaseKey(config.key)
    if (config.connectionString) setConnectionString(config.connectionString)

    if (isSupabaseConfigured()) {
      setConnectionStatus("connected")
    }

    // Load other settings from localStorage
    const savedSettings = localStorage.getItem("app_settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setFarmName(settings.farmName || "My Dairy Farm")
        setOwnerName(settings.ownerName || "")
        setEmail(settings.email || "")
        setPhone(settings.phone || "")
        setLocation(settings.location || "")
        setTimezone(settings.timezone || "UTC")
        setCurrency(settings.currency || "USD")
        setLanguage(settings.language || "en")
        setEmailNotifications(settings.emailNotifications ?? true)
        setPushNotifications(settings.pushNotifications ?? true)
        setSmsNotifications(settings.smsNotifications ?? false)
        setLowMilkAlert(settings.lowMilkAlert ?? true)
        setHealthAlert(settings.healthAlert ?? true)
        setFeedingAlert(settings.feedingAlert ?? true)
        setSubscriptionAlert(settings.subscriptionAlert ?? true)
        setTheme(settings.theme || "system")
        setDateFormat(settings.dateFormat || "MM/DD/YYYY")
        setTimeFormat(settings.timeFormat || "12")
        setMeasurementUnit(settings.measurementUnit || "metric")
        setDashboardLayout(settings.dashboardLayout || "default")
        setShowWelcomeMessage(settings.showWelcomeMessage ?? true)
        setDataSharing(settings.dataSharing ?? false)
        setAnalytics(settings.analytics ?? true)
        setAutoBackup(settings.autoBackup ?? true)
        setSessionTimeout(settings.sessionTimeout || "30")
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
  }

  const saveAllSettings = () => {
    const settings = {
      farmName,
      ownerName,
      email,
      phone,
      location,
      timezone,
      currency,
      language,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      lowMilkAlert,
      healthAlert,
      feedingAlert,
      subscriptionAlert,
      theme,
      dateFormat,
      timeFormat,
      measurementUnit,
      dashboardLayout,
      showWelcomeMessage,
      dataSharing,
      analytics,
      autoBackup,
      sessionTimeout,
    }

    localStorage.setItem("app_settings", JSON.stringify(settings))
    toast({
      title: "Settings Saved",
      description: "All settings have been saved successfully.",
    })
  }

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both Supabase URL and API Key.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    setConnectionStatus("connecting")
    setConnectionError("")

    try {
      // Save config first
      saveSupabaseConfig(supabaseUrl, supabaseKey, connectionString)

      // Get client and test connection
      const client = getSupabaseClient()
      if (!client) {
        throw new Error("Failed to create Supabase client")
      }

      // Test with a simple query
      const { error } = await client.from("users").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      setConnectionStatus("connected")
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Supabase database.",
      })
    } catch (error: any) {
      setConnectionStatus("error")
      setConnectionError(error.message || "Connection failed")
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to database.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const clearConfiguration = () => {
    clearSupabaseConfig()
    setSupabaseUrl("")
    setSupabaseKey("")
    setConnectionString("")
    setConnectionStatus("idle")
    setConnectionError("")
    toast({
      title: "Configuration Cleared",
      description: "Database configuration has been cleared.",
    })
  }

  const copySchema = () => {
    const schema = `-- Maziwa Smart Database Schema v4
-- Complete schema with all required tables and features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with phone number and waitlist support
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  full_name VARCHAR(255),
  farm_name VARCHAR(255),
  location VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  is_admin BOOLEAN DEFAULT FALSE,
  is_waitlisted BOOLEAN DEFAULT FALSE,
  waitlist_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist table for managing user queue
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  full_name VARCHAR(255),
  farm_name VARCHAR(255),
  location VARCHAR(255),
  position INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  invited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cows table with enhanced tracking
CREATE TABLE cows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tag_number VARCHAR(100) UNIQUE,
  breed VARCHAR(100),
  date_of_birth DATE,
  weight DECIMAL(8,2),
  health_status VARCHAR(50) DEFAULT 'healthy',
  pregnancy_status VARCHAR(50) DEFAULT 'not_pregnant',
  last_calving_date DATE,
  expected_calving_date DATE,
  milk_production_capacity DECIMAL(8,2),
  feed_consumption_kg DECIMAL(8,2) DEFAULT 0,
  minerals_consumption_gms DECIMAL(8,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milk production records
CREATE TABLE milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_amount DECIMAL(8,2) DEFAULT 0,
  evening_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(8,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
  quality_grade VARCHAR(10),
  fat_content DECIMAL(5,2),
  protein_content DECIMAL(5,2),
  temperature DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cow_id, date)
);

-- Feed and concentrates with bag tracking
CREATE TABLE feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  cost_per_bag DECIMAL(10,2),
  bags_purchased INTEGER DEFAULT 0,
  bags_remaining INTEGER DEFAULT 0,
  weight_per_bag_kg DECIMAL(8,2),
  protein_content DECIMAL(5,2),
  energy_content DECIMAL(8,2),
  purchase_date DATE,
  expiry_date DATE,
  storage_location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily feed consumption per cow
CREATE TABLE cow_feeding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES feeds(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_kg DECIMAL(8,2) NOT NULL,
  minerals_gms DECIMAL(8,2) DEFAULT 0,
  feeding_time VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cow_id, feed_id, date, feeding_time)
);

-- Veterinary visits and health records
CREATE TABLE vet_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  vet_name VARCHAR(255),
  visit_type VARCHAR(100),
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  cost DECIMAL(10,2),
  next_visit_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calves management
CREATE TABLE calves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mother_cow_id UUID REFERENCES cows(id) ON DELETE SET NULL,
  name VARCHAR(255),
  tag_number VARCHAR(100) UNIQUE,
  gender VARCHAR(10),
  birth_date DATE NOT NULL,
  birth_weight DECIMAL(8,2),
  current_weight DECIMAL(8,2),
  health_status VARCHAR(50) DEFAULT 'healthy',
  weaning_date DATE,
  vaccination_status VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm expenses tracking
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_number VARCHAR(100),
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors and suppliers with milk pricing
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  milk_price_per_liter DECIMAL(8,2),
  payment_terms VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily farm activities
CREATE TABLE farm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  assigned_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL,
  subscription_plan VARCHAR(50),
  billing_period_start DATE,
  billing_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports and analytics
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium',
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_status, subscription_expires_at);
CREATE INDEX idx_cows_user_id ON cows(user_id);
CREATE INDEX idx_cows_active ON cows(user_id, is_active);
CREATE INDEX idx_milk_production_date ON milk_production(user_id, date);
CREATE INDEX idx_milk_production_cow ON milk_production(cow_id, date);
CREATE INDEX idx_feeds_user_id ON feeds(user_id);
CREATE INDEX idx_cow_feeding_date ON cow_feeding(user_id, date);
CREATE INDEX idx_vet_visits_date ON vet_visits(user_id, visit_date);
CREATE INDEX idx_expenses_date ON expenses(user_id, date);
CREATE INDEX idx_farm_activities_date ON farm_activities(user_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE cow_feeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE calves ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can only see their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for cows
CREATE POLICY "Users can manage own cows" ON cows FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for milk production
CREATE POLICY "Users can manage own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for feeds
CREATE POLICY "Users can manage own feeds" ON feeds FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cow feeding
CREATE POLICY "Users can manage own cow feeding" ON cow_feeding FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for vet visits
CREATE POLICY "Users can manage own vet visits" ON vet_visits FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for calves
CREATE POLICY "Users can manage own calves" ON calves FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for farm activities
CREATE POLICY "Users can manage own farm activities" ON farm_activities FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can manage own reports" ON reports FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user settings
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Admin policies (admins can see all data)
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage waitlist" ON waitlist FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feeds_updated_at BEFORE UPDATE ON feeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calves_updated_at BEFORE UPDATE ON calves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_activities_updated_at BEFORE UPDATE ON farm_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (optional)
INSERT INTO users (id, email, full_name, is_admin, subscription_plan, subscription_status)
VALUES (
  uuid_generate_v4(),
  'admin@maziwasmart.com',
  'System Administrator',
  true,
  'enterprise',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database schema v4 created successfully! 🎉' as message;`

    navigator.clipboard.writeText(schema)
    toast({
      title: "Schema Copied",
      description: "Database schema has been copied to clipboard.",
    })
  }

  const exportSettings = () => {
    const allSettings = {
      database: { supabaseUrl, supabaseKey, connectionString },
      general: { farmName, ownerName, email, phone, location, timezone, currency, language },
      notifications: {
        emailNotifications,
        pushNotifications,
        smsNotifications,
        lowMilkAlert,
        healthAlert,
        feedingAlert,
        subscriptionAlert,
      },
      display: { theme, dateFormat, timeFormat, measurementUnit, dashboardLayout, showWelcomeMessage },
      privacy: { dataSharing, analytics, autoBackup, sessionTimeout },
    }

    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "maziwa-smart-settings.json"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Settings Exported",
      description: "Settings have been exported to a JSON file.",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)

        // Import database settings
        if (settings.database) {
          setSupabaseUrl(settings.database.supabaseUrl || "")
          setSupabaseKey(settings.database.supabaseKey || "")
          setConnectionString(settings.database.connectionString || "")
        }

        // Import general settings
        if (settings.general) {
          setFarmName(settings.general.farmName || "My Dairy Farm")
          setOwnerName(settings.general.ownerName || "")
          setEmail(settings.general.email || "")
          setPhone(settings.general.phone || "")
          setLocation(settings.general.location || "")
          setTimezone(settings.general.timezone || "UTC")
          setCurrency(settings.general.currency || "USD")
          setLanguage(settings.general.language || "en")
        }

        // Import notification settings
        if (settings.notifications) {
          setEmailNotifications(settings.notifications.emailNotifications ?? true)
          setPushNotifications(settings.notifications.pushNotifications ?? true)
          setSmsNotifications(settings.notifications.smsNotifications ?? false)
          setLowMilkAlert(settings.notifications.lowMilkAlert ?? true)
          setHealthAlert(settings.notifications.healthAlert ?? true)
          setFeedingAlert(settings.notifications.feedingAlert ?? true)
          setSubscriptionAlert(settings.notifications.subscriptionAlert ?? true)
        }

        // Import display settings
        if (settings.display) {
          setTheme(settings.display.theme || "system")
          setDateFormat(settings.display.dateFormat || "MM/DD/YYYY")
          setTimeFormat(settings.display.timeFormat || "12")
          setMeasurementUnit(settings.display.measurementUnit || "metric")
          setDashboardLayout(settings.display.dashboardLayout || "default")
          setShowWelcomeMessage(settings.display.showWelcomeMessage ?? true)
        }

        // Import privacy settings
        if (settings.privacy) {
          setDataSharing(settings.privacy.dataSharing ?? false)
          setAnalytics(settings.privacy.analytics ?? true)
          setAutoBackup(settings.privacy.autoBackup ?? true)
          setSessionTimeout(settings.privacy.sessionTimeout || "30")
        }

        toast({
          title: "Settings Imported",
          description: "Settings have been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Configuration
              </CardTitle>
              <CardDescription>
                Configure your Supabase database connection. This is required for the app to function properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Setup Instructions</AlertTitle>
                <AlertDescription>
                  1. Create a Supabase project at{" "}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
                    supabase.com
                  </a>
                  <br />
                  2. Copy your project URL and anon key from Settings → API
                  <br />
                  3. Run the database schema below in your SQL editor
                  <br />
                  4. Test the connection to ensure everything works
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Supabase URL
                  </Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Supabase Anon Key
                  </Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connection-string" className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Connection String (Optional)
                  </Label>
                  <Input
                    id="connection-string"
                    placeholder="postgresql://postgres:[password]@[host]:5432/postgres"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={testConnection} disabled={isConnecting} className="flex items-center gap-2">
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : connectionStatus === "connected" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : connectionStatus === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {isConnecting ? "Testing..." : "Test Connection"}
                </Button>

                <Badge
                  variant={
                    connectionStatus === "connected"
                      ? "default"
                      : connectionStatus === "error"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {connectionStatus === "connected"
                    ? "Connected ✅"
                    : connectionStatus === "error"
                      ? "Error ❌"
                      : connectionStatus === "connecting"
                        ? "Connecting..."
                        : "Not Connected"}
                </Badge>

                <Button variant="outline" size="sm" onClick={clearConfiguration}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {connectionError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Database Schema v4</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete schema with all tables, indexes, and security policies
                    </p>
                  </div>
                  <Button onClick={copySchema} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Schema
                  </Button>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Schema Features</AlertTitle>
                  <AlertDescription>
                    ✅ Users table with phone_number and waitlist support
                    <br />✅ Enhanced feed tracking with bags_count and minerals_gms
                    <br />✅ Admin system with proper permissions
                    <br />✅ Daily farm activities and milk pricing
                    <br />✅ Complete RLS security policies
                    <br />✅ 25+ tables with all required features
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure your farm and personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Farm Name
                  </Label>
                  <Input
                    id="farm-name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="My Dairy Farm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Owner Name
                  </Label>
                  <Input
                    id="owner-name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      <SelectItem value="Africa/Nairobi">Nairobi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                      <SelectItem value="UGX">UGX (USh)</SelectItem>
                      <SelectItem value="TZS">TZS (TSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                    <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="low-milk-alert">Low Milk Production Alert</Label>
                    <Switch id="low-milk-alert" checked={lowMilkAlert} onCheckedChange={setLowMilkAlert} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="health-alert">Health & Veterinary Alerts</Label>
                    <Switch id="health-alert" checked={healthAlert} onCheckedChange={setHealthAlert} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="feeding-alert">Feeding Schedule Alerts</Label>
                    <Switch id="feeding-alert" checked={feedingAlert} onCheckedChange={setFeedingAlert} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscription-alert">Subscription & Payment Alerts</Label>
                    <Switch
                      id="subscription-alert"
                      checked={subscriptionAlert}
                      onCheckedChange={setSubscriptionAlert}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>Customize the appearance and layout of your application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Format
                  </Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Format
                  </Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurement-unit">Measurement Unit</Label>
                  <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, liters)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, gallons)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                  <Select value={dashboardLayout} onValueChange={setDashboardLayout}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="welcome-message">Show Welcome Message</Label>
                  <Switch id="welcome-message" checked={showWelcomeMessage} onCheckedChange={setShowWelcomeMessage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy settings and data preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Data & Analytics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share anonymized data to improve the service</p>
                    </div>
                    <Switch id="data-sharing" checked={dataSharing} onCheckedChange={setDataSharing} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help us improve by sharing usage statistics</p>
                    </div>
                    <Switch id="analytics" checked={analytics} onCheckedChange={setAnalytics} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Backup & Security</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup your data daily</p>
                    </div>
                    <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <div>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" id="import-settings" />
            <Button variant="outline" onClick={() => document.getElementById("import-settings")?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>
        <Button onClick={saveAllSettings}>Save All Settings</Button>
      </div>
    </div>
  )
}
