-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- ANALYSES TABLE POLICIES
-- ============================================

-- Users can view their own analyses or public analyses
CREATE POLICY "Users can view own or public analyses"
  ON analyses FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = TRUE
  );

-- Users can create analyses for themselves
CREATE POLICY "Users can create own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create transactions for themselves
CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON POLICY "Users can view own profile" ON users IS 'Allow users to view their own profile data';
COMMENT ON POLICY "Users can view own or public analyses" ON analyses IS 'Allow users to view their analyses and public analyses';
COMMENT ON POLICY "Users can view own transactions" ON transactions IS 'Allow users to view their payment transactions';
