# Database Migration - Fix Privy Authentication

## Problem
Privy user IDs use format `did:privy:xxx` but database `user_id` columns are type UUID.

Error: `invalid input syntax for type uuid: "did:privy:cmjsc6vzw0022l80eju7wceb1"`

## Solution
Change `user_id` columns from UUID to TEXT in these tables:
- `analyses.user_id`
- `user_analyses.user_id`
- `users.id`

## Migration Steps

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/usqshixzparnmykghtzn/sql/new

### 2. Copy and paste this SQL:

```sql
-- 1. Drop foreign key constraints
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;
ALTER TABLE user_analyses DROP CONSTRAINT IF EXISTS user_analyses_user_id_fkey;

-- 2. Change column types to TEXT
ALTER TABLE analyses ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_analyses ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- 3. Re-add foreign key constraints
ALTER TABLE analyses ADD CONSTRAINT analyses_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_analyses ADD CONSTRAINT user_analyses_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### 3. Click "Run" button

### 4. Verify migration
After running, you should see success message in Supabase Dashboard.

### 5. Test the app
1. Go to http://localhost:3000
2. Sign in with Google
3. Enter a Polymarket URL: https://polymarket.com/event/who-will-trump-nominate-as-fed-chair
4. Click "Analyze"
5. Should work without UNKNOWN_ERROR

## Files to delete after migration
- `/src/app/api/admin/migrate/route.ts` (temporary admin route)
- `/public/migrate.html` (temporary migration page)
- `/scripts/run-migration.mjs` (temporary script)
- `/scripts/apply-migration.mjs` (temporary script)

## Restore normal error handling
In `/src/app/api/analyze/route.ts`, remove the try-catch that sets `dailyCount = 0` on error.
