-- Performance Indexes for Weekly Planner
-- Safe to run multiple times - uses IF NOT EXISTS

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_week ON appointments(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_day ON appointments(user_id, day_index, week_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_slot ON appointments(user_id, slot_key);
CREATE INDEX IF NOT EXISTS idx_appointments_user_custom ON appointments(user_id, custom_id, week_key);
CREATE INDEX IF NOT EXISTS idx_appointments_updated ON appointments(user_id, updated_at DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_day ON tasks(user_id, day_key, week_key);
CREATE INDEX IF NOT EXISTS idx_tasks_user_week ON tasks(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(user_id, updated_at DESC);

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_user_day ON metrics(user_id, day_key, week_key);
CREATE INDEX IF NOT EXISTS idx_metrics_user_week ON metrics(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_metrics_updated ON metrics(user_id, updated_at DESC);

-- Weekly Overviews indexes
CREATE INDEX IF NOT EXISTS idx_overviews_user_week ON weekly_overviews(user_id, week_key);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status_role ON profiles(status, role);
CREATE INDEX IF NOT EXISTS idx_profiles_expiry ON profiles(expiry_date);

-- Maintenance function
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

-- Run statistics
SELECT analyze_weekly_planner_tables();
