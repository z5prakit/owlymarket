/**
 * Add progress columns to analyses table using Supabase client
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://usqshixzparnmykghtzn.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNoaXh6cGFybm15a2dodHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3OTA4NywiZXhwIjoyMDgyNTU1MDg3fQ.pjIQ0EAR9-yzPow1DPdujJ38CKrujvdFvLD-aY78Il4'

async function addColumns() {
  console.log('Creating Supabase client...')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log('Checking if columns already exist...')

  // Try to select from the columns - if they don't exist, we need to add them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: testData, error: testError } = await supabase
    .from('analyses')
    .select('progress_step, progress_message')
    .limit(1)

  if (testError) {
    console.log('Columns do not exist yet. Error:', testError.message)
  } else {
    console.log('Columns already exist!')
    return
  }

  console.log('\nColumns need to be added.')
  console.log('Please run this SQL manually in Supabase SQL Editor:')
  console.log('\n' + '='.repeat(60))
  console.log(`
-- Add progress tracking columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS progress_step TEXT,
ADD COLUMN IF NOT EXISTS progress_message TEXT;

-- Add comment
COMMENT ON COLUMN analyses.progress_step IS 'Current step in the analysis process (planning, researching, critiquing, analyzing, reporting)';
COMMENT ON COLUMN analyses.progress_message IS 'Human-readable progress message for UI display';
  `.trim())
  console.log('=' .repeat(60) + '\n')
  console.log('Or visit: https://supabase.com/dashboard/project/usqshixzparnmykghtzn/sql/new')
}

addColumns().catch(console.error)
