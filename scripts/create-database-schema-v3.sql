-- Enhanced Maziwa Smart Database Schema v3
-- Includes phone_number fix, waitlist system, and admin functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with phone_number and admin fields
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20), -- Fixed: Added phone_number column
    county VARCHAR(100),
    farm_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE, -- Admin flag
    role VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin
    admin_permissions JSONB DEFAULT '{}', -- Granular admin permissions
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table for managing signup rate limits
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    county VARCHAR(100),
    farm_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, converted
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    converted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cows table
CREATE TABLE IF NOT EXISTS cows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create milk production table
CREATE TABLE IF NOT EXISTS milk_production (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
    production_date DATE NOT NULL,
    morning_yield DECIMAL(8,2) DEFAULT 0,
    evening_yield DECIMAL(8,2) DEFAULT 0,
    total_yield DECIMAL(8,2) GENERATED ALWAYS AS (morning_yield + evening_yield) STORED,
    quality_grade VARCHAR(10) DEFAULT 'A',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cow_id, production_date)
);

-- Create feed inventory table with bags count
CREATE TABLE IF NOT EXISTS feed_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_type VARCHAR(100) NOT NULL,
    feed_name VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    bags_count INTEGER DEFAULT 0, -- Number of bags to purchase
    cost_per_kg DECIMAL(8,2),
    supplier VARCHAR(255),
    purchase_date DATE,
    expiry_date DATE,
    storage_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feed consumption table with minerals tracking
CREATE TABLE IF NOT EXISTS feed_consumption (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    feed_inventory_id UUID REFERENCES feed_inventory(id),
    consumption_date DATE NOT NULL,
    feed_amount_kg DECIMAL(8,2) NOT NULL DEFAULT 0, -- Feed consumed per day in kg
    minerals_gms DECIMAL(8,2) DEFAULT 0, -- Minerals consumed per day in grams
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cow_id, feed_inventory_id, consumption_date)
);

-- Create vendors table with milk pricing
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    vendor_type VARCHAR(50) NOT NULL, -- feed_supplier, milk_buyer, equipment, veterinary
    milk_price_per_liter DECIMAL(8,2), -- Milk pricing for vendors
    payment_terms VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(50), -- weekly, monthly, yearly
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vet visits table
CREATE TABLE IF NOT EXISTS vet_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    veterinarian_name VARCHAR(255),
    visit_type VARCHAR(100) NOT NULL, -- checkup, treatment, vaccination, emergency
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    cost DECIMAL(8,2),
    next_visit_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily activities table
CREATE TABLE IF NOT EXISTS daily_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(100) NOT NULL, -- milking, feeding, cleaning, health_check, breeding
    cow_id UUID REFERENCES cows(id),
    description TEXT NOT NULL,
    duration_minutes INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calves table
CREATE TABLE IF NOT EXISTS calves (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mother_cow_id UUID REFERENCES cows(id),
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    birth_weight_kg DECIMAL(6,2),
    current_weight_kg DECIMAL(6,2),
    health_status VARCHAR(50) DEFAULT 'healthy',
    weaning_date DATE,
    is_weaned BOOLEAN DEFAULT FALSE,
    vaccination_status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(production_date);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_user_id ON feed_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_date ON feed_consumption(consumption_date);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_vet_visits_user_id ON vet_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON daily_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_calves_user_id ON calves(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calves ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for waitlist (admins can manage)
CREATE POLICY "Admins can manage waitlist" ON waitlist FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Create RLS policies for cows
CREATE POLICY "Users can manage own cows" ON cows FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for milk production
CREATE POLICY "Users can manage own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for feed inventory
CREATE POLICY "Users can manage own feed inventory" ON feed_inventory FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for feed consumption
CREATE POLICY "Users can manage own feed consumption" ON feed_consumption FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for vendors
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for vet visits
CREATE POLICY "Users can manage own vet visits" ON vet_visits FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for daily activities
CREATE POLICY "Users can manage own daily activities" ON daily_activities FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for calves
CREATE POLICY "Users can manage own calves" ON calves FOR ALL USING (auth.uid() = user_id);

-- Create admin policies (admins can view all data)
CREATE POLICY "Admins can view all cows" ON cows FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

CREATE POLICY "Admins can view all milk production" ON milk_production FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Insert sample admin user (update with your actual admin email)
-- Note: You'll need to create this user in Supabase Auth first, then update this record
-- INSERT INTO users (email, password_hash, full_name, is_admin, role, admin_permissions) 
-- VALUES (
--     'admin@maziwasmart.com', 
--     'placeholder_hash', 
--     'System Administrator', 
--     true, 
--     'super_admin',
--     '{"manage_users": true, "manage_waitlist": true, "view_all_data": true, "system_settings": true}'
-- );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_production_updated_at BEFORE UPDATE ON milk_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_inventory_updated_at BEFORE UPDATE ON feed_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_consumption_updated_at BEFORE UPDATE ON feed_consumption FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_visits_updated_at BEFORE UPDATE ON vet_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_activities_updated_at BEFORE UPDATE ON daily_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calves_updated_at BEFORE UPDATE ON calves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
