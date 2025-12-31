-- Payment Transactions Table
-- Stores verified payment transactions to prevent reuse

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount DECIMAL(18, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  network TEXT NOT NULL DEFAULT 'base',
  chain_id INTEGER NOT NULL DEFAULT 8453,
  block_number BIGINT NOT NULL,
  tx_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_tx_hash ON payment_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_analysis_id ON payment_transactions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_from_address ON payment_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read payment transactions (for verification)
CREATE POLICY "Public can view payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (true);

-- Only service role can insert (via API)
CREATE POLICY "Service role can insert payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (true);
