-- Change user_id from UUID to TEXT to support Privy DID format
-- Privy user IDs are like: did:privy:cmjsc6vzw0022l80eju7wceb1

-- 1. Drop foreign key constraint on analyses table
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- 2. Change user_id column type in analyses table
ALTER TABLE analyses ALTER COLUMN user_id TYPE TEXT;

-- 3. Change id column in users table
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- 4. Re-add foreign key constraint
ALTER TABLE analyses
ADD CONSTRAINT analyses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
