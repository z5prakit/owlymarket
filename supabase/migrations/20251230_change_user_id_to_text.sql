-- Change user_id from UUID to TEXT to support Privy DID format
-- Privy user IDs are like: did:privy:cmjsc6vzw0022l80eju7wceb1

-- 1. Drop foreign key constraints first
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;
ALTER TABLE user_analyses DROP CONSTRAINT IF EXISTS user_analyses_user_id_fkey;

-- 2. Change user_id column type in analyses table
ALTER TABLE analyses
ALTER COLUMN user_id TYPE TEXT;

-- 3. Change user_id column type in user_analyses table (if exists)
ALTER TABLE user_analyses
ALTER COLUMN user_id TYPE TEXT;

-- 4. Change id column in users table (if exists)
ALTER TABLE users
ALTER COLUMN id TYPE TEXT;

-- 5. Re-add foreign key constraints
ALTER TABLE analyses
ADD CONSTRAINT analyses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_analyses
ADD CONSTRAINT user_analyses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
