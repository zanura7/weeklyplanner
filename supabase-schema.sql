-- Weekly Planner Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security (RLS)
-- Each user can only access their own data

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_key TEXT NOT NULL,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  hour INTEGER NOT NULL,
  category TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  custom_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slot_key)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_key TEXT NOT NULL,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  task_list JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_key)
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_key TEXT NOT NULL,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  open_count INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  follow_count INTEGER DEFAULT 0,
  close_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_key)
);

-- Weekly overviews table
CREATE TABLE IF NOT EXISTS weekly_overviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_key TEXT NOT NULL,
  remarks TEXT,
  ai_analysis TEXT,
  analysis_generated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_overviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for metrics
CREATE POLICY "Users can view own metrics" ON metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics" ON metrics
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for weekly_overviews
CREATE POLICY "Users can view own weekly_overviews" ON weekly_overviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly_overviews" ON weekly_overviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly_overviews" ON weekly_overviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly_overviews" ON weekly_overviews
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_overviews;
