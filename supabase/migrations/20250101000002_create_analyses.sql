-- Create analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_url TEXT NOT NULL,
  market_source TEXT NOT NULL CHECK (market_source IN ('polymarket', 'kalshi')),
  market_id TEXT,
  market_title TEXT,
  report_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analyses table
CREATE INDEX idx_analyses_user ON analyses(user_id, created_at DESC);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_public ON analyses(is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_analyses_market ON analyses(market_source, market_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment analyses count when analysis completes
CREATE OR REPLACE FUNCTION increment_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE users
    SET analyses_count = analyses_count + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_user_analyses_count
  AFTER INSERT OR UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION increment_analyses_count();

-- Add comment
COMMENT ON TABLE analyses IS 'Market analyses with AI-generated reports';
