-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  chain TEXT DEFAULT 'BSC',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  verified_at TIMESTAMP WITH TIME ZONE,
  subscription_months INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transactions table
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Add comment
COMMENT ON TABLE transactions IS 'BSC USDT payment transactions for subscriptions';
