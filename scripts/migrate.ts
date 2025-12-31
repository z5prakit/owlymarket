/**
 * Run database migration to add progress tracking columns
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('Running migration: Add progress tracking columns...')

  // Use raw SQL via rpc
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE analyses
      ADD COLUMN IF NOT EXISTS progress_step TEXT,
      ADD COLUMN IF NOT EXISTS progress_message TEXT;
    `
  })

  if (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  console.log('✓ Migration completed successfully!')
  console.log('Added columns: progress_step, progress_message')
}

runMigration()
