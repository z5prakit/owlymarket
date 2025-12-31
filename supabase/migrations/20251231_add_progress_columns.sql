-- Add progress tracking columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS progress_step TEXT,
ADD COLUMN IF NOT EXISTS progress_message TEXT;

-- Add comment
COMMENT ON COLUMN analyses.progress_step IS 'Current step in the analysis process (planning, researching, critiquing, analyzing, reporting)';
COMMENT ON COLUMN analyses.progress_message IS 'Human-readable progress message for UI display';
