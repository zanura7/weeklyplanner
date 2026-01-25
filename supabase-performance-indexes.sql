-- =============================================
-- Performance Indexes for Weekly Planner
-- Run this in Supabase SQL Editor to improve query performance
-- =============================================

-- 1. Appointments Table Indexes
-- Optimize weekly appointment lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_appointments_user_week 
  ON appointments(user_id, week_key);

-- Optimize daily appointment lookups
CREATE INDEX IF NOT EXISTS idx_appointments_user_day 
  ON appointments(user_id, day_index, week_key);

-- Optimize slot-based lookups (30-min time slots)
CREATE INDEX IF NOT EXISTS idx_appointments_user_slot 
  ON appointments(user_id, slot_key);

-- Composite index for custom activity lookups
CREATE INDEX IF NOT EXISTS idx_appointments_user_custom 
  ON appointments(user_id, custom_id, week_key);

-- 2. Tasks Table Indexes
-- Optimize daily task lookups
CREATE INDEX IF NOT EXISTS idx_tasks_user_day 
  ON tasks(user_id, day_key, week_key);

-- Optimize weekly task aggregation
CREATE INDEX IF NOT EXISTS idx_tasks_user_week 
  ON tasks(user_id, week_key);

-- 3. Metrics Table Indexes
-- Optimize daily metrics lookups
CREATE INDEX IF NOT EXISTS idx_metrics_user_day 
  ON metrics(user_id, day_key, week_key);

-- Optimize weekly metrics aggregation
CREATE INDEX IF NOT EXISTS idx_metrics_user_week 
  ON metrics(user_id, week_key);

-- 4. Weekly Overviews Table Indexes
-- Optimize weekly overview lookups
CREATE INDEX IF NOT EXISTS idx_overviews_user_week 
  ON weekly_overviews(user_id, week_key);

-- 5. Profiles Table Indexes
-- Optimize admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_status 
  ON profiles(status);

-- Optimize user search by email
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Optimize role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

-- Composite index for admin dashboard filters
CREATE INDEX IF NOT EXISTS idx_profiles_status_role 
  ON profiles(status, role);

-- Index for expiry date queries
CREATE INDEX IF NOT EXISTS idx_profiles_expiry 
  ON profiles(expiry_date);

-- 6. Updated At Indexes (for time-based queries)
CREATE INDEX IF NOT EXISTS idx_appointments_updated 
  ON appointments(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_updated 
  ON tasks(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_updated 
  ON metrics(user_id, updated_at DESC);

-- 7. Full-Text Search Indexes (for future search features)
CREATE INDEX IF NOT EXISTS idx_appointments_activity_gin 
  ON appointments USING gin(to_tsvector('english', activity_type));

CREATE INDEX IF NOT EXISTS idx_appointments_description_gin 
  ON appointments USING gin(to_tsvector('english', description));

-- =============================================
-- Index Statistics & Maintenance
-- =============================================

-- Function to analyze tables and update statistics
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

-- Run analysis immediately
SELECT analyze_weekly_planner_tables();

-- =============================================
-- Verification Queries
-- =============================================

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('appointments', 'tasks', 'metrics', 'weekly_overviews', 'profiles')
ORDER BY idx_scan DESC;

-- Expected output: All indexes should show 0 scans initially
-- but will be used as queries are executed

-- =============================================
-- Performance Monitoring Query
-- =============================================

-- Monitor slow queries (run this periodically)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%appointments%' 
   OR query LIKE '%tasks%'
   OR query LIKE '%metrics%'
   OR query LIKE '%weekly_overviews%'
ORDER BY mean_time DESC
LIMIT 10;

-- =============================================
-- Estimated Performance Improvements
-- =============================================

-- Before indexes: Sequential scans on all queries
-- After indexes: 
--   - Weekly appointment queries: 10-100x faster
--   - Daily task lookups: 5-50x faster
--   - Admin dashboard: 20-200x faster
--   - User profile searches: 100-1000x faster

-- =============================================
-- Rollback Script (if needed)
-- =============================================

-- Uncomment these lines to remove all indexes
-- DROP INDEX IF EXISTS idx_appointments_user_week;
-- DROP INDEX IF EXISTS idx_appointments_user_day;
-- DROP INDEX IF EXISTS idx_appointments_user_slot;
-- DROP INDEX IF EXISTS idx_appointments_user_custom;
-- DROP INDEX IF EXISTS idx_tasks_user_day;
-- DROP INDEX IF EXISTS idx_tasks_user_week;
-- DROP INDEX IF EXISTS idx_metrics_user_day;
-- DROP INDEX IF EXISTS idx_metrics_user_week;
-- DROP INDEX IF EXISTS idx_overviews_user_week;
-- DROP INDEX IF EXISTS idx_profiles_status;
-- DROP INDEX IF EXISTS idx_profiles_email;
-- DROP INDEX IF EXISTS idx_profiles_role;
-- DROP INDEX IF EXISTS idx_profiles_status_role;
-- DROP INDEX IF EXISTS idx_profiles_expiry;
-- DROP INDEX IF EXISTS idx_appointments_updated;
-- DROP INDEX IF EXISTS idx_tasks_updated;
-- DROP INDEX IF EXISTS idx_metrics_updated;
-- DROP INDEX IF EXISTS idx_appointments_activity_gin;
-- DROP INDEX IF EXISTS idx_appointments_description_gin;
