-- Maziwa Smart Complete Database Schema
-- Run this script in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (uncomment if you want to recreate)
-- DROP TABLE IF EXISTS feed_consumption CASCADE;
-- DROP TABLE IF EXISTS vet_visits CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS vendors CASCADE;
-- DROP TABLE IF EXISTS feed_inventory CASCADE;
-- DROP TABLE IF EXISTS milk_production CASCADE;
-- DROP TABLE IF EXISTS cows CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table (main user profiles)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cows table
CREATE TABLE IF NOT EXISTS cows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(100),
    age INTEGER,
    weight DECIMAL(10,2),
    health_status VARCHAR(50) DEFAULT 'healthy',
    last_calving_date DATE,
    expected_calving_date DATE,
    milk_production_avg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milk production records
CREATE TABLE IF NOT EXISTS milk_production (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    morning_amount DECIMAL(10,2) DEFAULT 0,
    evening_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
    quality_grade VARCHAR(20) DEFAULT 'A',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cow_id, date)
);

-- Feed inventory table
CREATE TABLE IF NOT EXISTS feed_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feed_type VARCHAR(100) NOT NULL,
    feed_name VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    bags_count INTEGER DEFAULT 1,
    bag_weight_kg DECIMAL(10,2) DEFAULT 50,
    cost_per_bag DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    purchase_date DATE NOT NULL,
    supplier_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed consumption tracking
CREATE TABLE IF NOT EXISTS feed_consumption (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
    feed_id UUID REFERENCES feed_inventory(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_kg DECIMAL(10,2) NOT NULL,
    minerals_gms INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cow_id, feed_id, date)
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    milk_price_per_liter DECIMAL(10,2),
    payment_terms TEXT,
    vendor_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    payment_method VARCHAR(50),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veterinary visits table
CREATE TABLE IF NOT EXISTS vet_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    vet_name VARCHAR(255) NOT NULL,
    vet_phone VARCHAR(20),
    reason TEXT NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medications JSONB DEFAULT '[]'::jsonb,
    cost DECIMAL(10,2) NOT NULL,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_user_date ON milk_production(user_id, date);
CREATE INDEX IF NOT EXISTS idx_milk_production_cow_date ON milk_production(cow_id, date);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_user_date ON feed_consumption(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_visits_user_date ON vet_visits(user_id, visit_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_cows_updated_at ON cows;
DROP TRIGGER IF EXISTS update_milk_production_updated_at ON milk_production;
DROP TRIGGER IF EXISTS update_feed_inventory_updated_at ON feed_inventory;
DROP TRIGGER IF EXISTS update_feed_consumption_updated_at ON feed_consumption;
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_vet_visits_updated_at ON vet_visits;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_production_updated_at BEFORE UPDATE ON milk_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_inventory_updated_at BEFORE UPDATE ON feed_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_consumption_updated_at BEFORE UPDATE ON feed_consumption FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_visits_updated_at BEFORE UPDATE ON vet_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user for testing
INSERT INTO users (email, full_name, phone_number, role, subscription_status, subscription_plan) 
VALUES (
    'admin@maziwa.com',
    'System Administrator',
    '+254700000000',
    'admin',
    'active',
    'enterprise'
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Maziwa Smart database schema created successfully! 🐄✅' as result;

-- Show created tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'cows', 'milk_production', 'feed_inventory', 'feed_consumption', 'vendors', 'expenses', 'vet_visits')
ORDER BY tablename;
