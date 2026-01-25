# Migration Verification

## Quick Check

Run this query in Supabase SQL Editor to verify indexes:

```sql
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN ('appointments', 'tasks', 'metrics', 'weekly_overviews', 'profiles')
  AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY tablename;
```

## Expected Results

You should see:
- **appointments**: 5 indexes
- **tasks**: 3 indexes
- **metrics**: 3 indexes
- **weekly_overviews**: 1 index
- **profiles**: 5 indexes

**Total: 17 indexes**

## If You See 0 Indexes

The migration may not have run correctly. Try:

1. Check if tables exist:
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('appointments', 'tasks', 'metrics', 'weekly_overviews', 'profiles');
```

2. If tables exist, re-run `add-performance-indexes-only.sql`

3. If tables don't exist, run the original `supabase-schema.sql` first

## Detailed View

To see all individual indexes:

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('appointments', 'tasks', 'metrics', 'weekly_overviews', 'profiles')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

## Test Performance

After verifying indexes exist, test performance:

```sql
-- Before (may be slow without index)
EXPLAIN ANALYZE 
SELECT * FROM appointments 
WHERE user_id = 'your-user-id' 
  AND week_key = '2025-W3';

-- After (should be much faster with index)
EXPLAIN ANALYZE 
SELECT * FROM appointments 
WHERE user_id = 'your-user-id' 
  AND week_key = '2025-W3';
```

Look for "Index Scan" in the EXPLAIN output - this means the index is being used!

---

**Status Check Complete!** ✅
