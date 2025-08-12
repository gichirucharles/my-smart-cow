-- Maziwa Smart Database Schema v4
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
SELECT 'Database schema v4 created successfully! 🎉' as message;
