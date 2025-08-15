-- Maziwa Smart Database Schema v5
-- Complete schema with all required tables and features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with phone number and waitlist support
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  full_name VARCHAR(255),
  farm_name VARCHAR(255),
  county VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'user',
  admin_permissions JSONB,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist table for managing user queue
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  county VARCHAR(255),
  farm_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  converted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cows table with enhanced tracking
CREATE TABLE IF NOT EXISTS cows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  age_months INTEGER,
  weight_kg DECIMAL(8,2),
  health_status VARCHAR(50) DEFAULT 'healthy',
  pregnancy_status VARCHAR(50) DEFAULT 'not_pregnant',
  last_calving_date DATE,
  expected_calving_date DATE,
  milk_yield_per_day DECIMAL(8,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milk production records
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_amount DECIMAL(8,2) DEFAULT 0,
  evening_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(8,2) DEFAULT 0,
  quality_grade VARCHAR(10),
  fat_content DECIMAL(5,2),
  protein_content DECIMAL(5,2),
  temperature DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cow_id, date)
);

-- Feed inventory with bag tracking
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feed_type VARCHAR(100) NOT NULL,
  feed_name VARCHAR(255) NOT NULL,
  quantity_kg DECIMAL(8,2) DEFAULT 0,
  bags_count INTEGER DEFAULT 0,
  cost_per_kg DECIMAL(10,2),
  supplier VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  storage_location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily feed consumption per cow with minerals
CREATE TABLE IF NOT EXISTS feed_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  feed_inventory_id UUID REFERENCES feed_inventory(id) ON DELETE SET NULL,
  consumption_date DATE NOT NULL,
  feed_amount_kg DECIMAL(8,2) DEFAULT 0,
  minerals_gms DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veterinary visits and health records
CREATE TABLE IF NOT EXISTS vet_visits (
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
CREATE TABLE IF NOT EXISTS calves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mother_cow_id UUID REFERENCES cows(id) ON DELETE SET NULL,
  name VARCHAR(255),
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
CREATE TABLE IF NOT EXISTS expenses (
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
CREATE TABLE IF NOT EXISTS vendors (
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
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  cow_id UUID REFERENCES cows(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
CREATE INDEX IF NOT EXISTS idx_cows_active ON cows(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(user_id, date);
CREATE INDEX IF NOT EXISTS idx_milk_production_cow ON milk_production(cow_id, date);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_date ON feed_consumption(user_id, consumption_date);
CREATE INDEX IF NOT EXISTS idx_vet_visits_date ON vet_visits(user_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON daily_activities(user_id, activity_date);

-- Function to automatically calculate milk production total
CREATE OR REPLACE FUNCTION update_milk_production_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount = COALESCE(NEW.morning_amount, 0) + COALESCE(NEW.evening_amount, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_amount automatically
DROP TRIGGER IF EXISTS trigger_update_milk_production_total ON milk_production;
CREATE TRIGGER trigger_update_milk_production_total
    BEFORE INSERT OR UPDATE ON milk_production
    FOR EACH ROW
    EXECUTE FUNCTION update_milk_production_total();

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cows_updated_at ON cows;
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feed_inventory_updated_at ON feed_inventory;
CREATE TRIGGER update_feed_inventory_updated_at BEFORE UPDATE ON feed_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feed_consumption_updated_at ON feed_consumption;
CREATE TRIGGER update_feed_consumption_updated_at BEFORE UPDATE ON feed_consumption FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calves_updated_at ON calves;
CREATE TRIGGER update_calves_updated_at BEFORE UPDATE ON calves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_activities_updated_at ON daily_activities;
CREATE TRIGGER update_daily_activities_updated_at BEFORE UPDATE ON daily_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist;
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE calves ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can manage own cows" ON cows;
DROP POLICY IF EXISTS "Users can manage own milk production" ON milk_production;
DROP POLICY IF EXISTS "Users can manage own feed inventory" ON feed_inventory;
DROP POLICY IF EXISTS "Users can manage own feed consumption" ON feed_consumption;
DROP POLICY IF EXISTS "Users can manage own vet visits" ON vet_visits;
DROP POLICY IF EXISTS "Users can manage own calves" ON calves;
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can manage own daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage waitlist" ON waitlist;

-- RLS Policies for users (users can only see their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for cows
CREATE POLICY "Users can manage own cows" ON cows FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for milk production
CREATE POLICY "Users can manage own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for feed inventory
CREATE POLICY "Users can manage own feed inventory" ON feed_inventory FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for feed consumption
CREATE POLICY "Users can manage own feed consumption" ON feed_consumption FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for vet visits
CREATE POLICY "Users can manage own vet visits" ON vet_visits FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for calves
CREATE POLICY "Users can manage own calves" ON calves FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for daily activities
CREATE POLICY "Users can manage own daily activities" ON daily_activities FOR ALL USING (auth.uid() = user_id);

-- Admin policies (admins can see all data)
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage waitlist" ON waitlist FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

-- Success message
SELECT 'Database schema v5 created successfully! 🎉' as message;
