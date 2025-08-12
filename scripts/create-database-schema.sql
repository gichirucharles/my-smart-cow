-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cows table
CREATE TABLE IF NOT EXISTS cows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    weight DECIMAL(10,2),
    health_status VARCHAR(50) NOT NULL DEFAULT 'healthy',
    last_calving_date DATE,
    expected_calving_date DATE,
    milk_production_avg DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milk_production table
CREATE TABLE IF NOT EXISTS milk_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    morning_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    evening_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
    quality_grade VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cow_id, date)
);

-- Create feed_inventory table
CREATE TABLE IF NOT EXISTS feed_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_type VARCHAR(50) NOT NULL,
    feed_name VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    bags_count INTEGER NOT NULL DEFAULT 1,
    bag_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 50,
    cost_per_bag DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    purchase_date DATE NOT NULL,
    supplier_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feed_consumption table
CREATE TABLE IF NOT EXISTS feed_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    feed_id UUID NOT NULL REFERENCES feed_inventory(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_kg DECIMAL(10,2) NOT NULL,
    minerals_gms DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    milk_price_per_liter DECIMAL(10,2),
    payment_terms VARCHAR(255),
    vendor_type VARCHAR(50) NOT NULL DEFAULT 'milk_buyer',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    payment_method VARCHAR(50),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vet_visits table
CREATE TABLE IF NOT EXISTS vet_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    vet_name VARCHAR(255) NOT NULL,
    vet_phone VARCHAR(20),
    reason TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    medications JSONB,
    cost DECIMAL(10,2) NOT NULL,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_cow_id ON milk_production(cow_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(date);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_user_id ON feed_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_cow_id ON feed_consumption(cow_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_visits_user_id ON vet_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_visits_cow_id ON vet_visits(cow_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Cows policies
CREATE POLICY "Users can manage own cows" ON cows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all cows" ON cows FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Milk production policies
CREATE POLICY "Users can manage own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all milk production" ON milk_production FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Feed inventory policies
CREATE POLICY "Users can manage own feed inventory" ON feed_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feed inventory" ON feed_inventory FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Feed consumption policies
CREATE POLICY "Users can manage own feed consumption" ON feed_consumption FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feed consumption" ON feed_consumption FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Vendors policies
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all vendors" ON vendors FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Expenses policies
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all expenses" ON expenses FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Vet visits policies
CREATE POLICY "Users can manage own vet visits" ON vet_visits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all vet visits" ON vet_visits FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON cows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_production_updated_at BEFORE UPDATE ON milk_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_inventory_updated_at BEFORE UPDATE ON feed_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_consumption_updated_at BEFORE UPDATE ON feed_consumption FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_visits_updated_at BEFORE UPDATE ON vet_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
