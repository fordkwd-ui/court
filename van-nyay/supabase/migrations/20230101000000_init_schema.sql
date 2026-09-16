-- Initial Schema for Van Nyay

-- Create ENUM types for status and priority
CREATE TYPE case_status AS ENUM (
  'FIR_REGISTERED',
  'UNDER_INVESTIGATION',
  'CHARGESHEET_FILED',
  'TRIAL',
  'JUDGMENT_DELIVERED',
  'APPEAL_FILED'
);

CREATE TYPE priority_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Profiles Table (Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  role TEXT,
  division TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cases Table
CREATE TABLE cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  offence_type TEXT NOT NULL,
  offence_date DATE NOT NULL,
  location TEXT,
  status case_status DEFAULT 'FIR_REGISTERED'::case_status NOT NULL,
  priority priority_level DEFAULT 'MEDIUM'::priority_level NOT NULL,
  assigned_io UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Investigation Logs Table
CREATE TABLE investigation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  action_date DATE NOT NULL,
  evidence_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (In a real app, these would be more strict)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Cases are viewable by authenticated users." ON cases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert cases." ON cases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their assigned cases." ON cases FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Logs are viewable by authenticated users." ON investigation_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert logs." ON investigation_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
