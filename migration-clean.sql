CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  mobile TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Enable insert for authentication" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, mobile, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    'user',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_appointments_user_week ON appointments(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_day ON appointments(user_id, day_index, week_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_slot ON appointments(user_id, slot_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_custom ON appointments(user_id, custom_id, week_key);
CREATE INDEX IF NOT EXISTS idx_tasks_user_day ON tasks(user_id, day_key, week_key);
CREATE INDEX IF NOT EXISTS idx_tasks_user_week ON tasks(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_metrics_user_day ON metrics(user_id, day_key, week_key);
CREATE INDEX IF NOT EXISTS idx_metrics_user_week ON metrics(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_overviews_user_week ON weekly_overviews(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status_role ON profiles(status, role);
CREATE INDEX IF NOT EXISTS idx_profiles_expiry ON profiles(expiry_date);
CREATE INDEX IF NOT EXISTS idx_appointments_updated ON appointments(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_updated ON metrics(user_id, updated_at DESC);
CREATE OR REPLACE FUNCTION analyze_weekly_planner_tables()
RETURNS void AS $$
BEGIN
  ANALYZE appointments;
  ANALYZE tasks;
  ANALYZE metrics;
  ANALYZE weekly_overviews;
  ANALYZE profiles;
  RAISE NOTICE 'Table statistics updated successfully';
END;
$$ LANGUAGE plpgsql;

SELECT analyze_weekly_planner_tables();
