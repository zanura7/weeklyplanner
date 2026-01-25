-- Verification Query - Run this to check if indexes were created successfully

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('appointments', 'tasks', 'metrics', 'weekly_overviews', 'profiles')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
