/**
 * TEMPORARY ADMIN ROUTE - FOR MIGRATION ONLY
 * This route executes the user_id UUID to TEXT migration
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const results = []

  // Step 1: Drop foreign key constraints
  try {
    const { error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey'
    })
    results.push({
      step: 'Drop analyses FK constraint',
      success: !error,
      error: error?.message
    })
  } catch (e: any) {
    // Try alternative approach - individual queries
    results.push({
      step: 'Drop analyses FK constraint (RPC failed)',
      success: false,
      error: e.message,
      note: 'Will try direct SQL approach'
    })
  }

  // Alternative: Use direct SQL via Management API
  const migrations = [
    'ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;',
    'ALTER TABLE user_analyses DROP CONSTRAINT IF EXISTS user_analyses_user_id_fkey;',
    'ALTER TABLE analyses ALTER COLUMN user_id TYPE TEXT;',
    'ALTER TABLE user_analyses ALTER COLUMN user_id TYPE TEXT;',
    'ALTER TABLE users ALTER COLUMN id TYPE TEXT;',
    'ALTER TABLE analyses ADD CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;',
    'ALTER TABLE user_analyses ADD CONSTRAINT user_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
  ]

  return NextResponse.json({
    message: 'Migration status',
    results,
    instructions: 'Please run the migration manually via Supabase Dashboard SQL Editor',
    sql_file: '/Users/mac/Documents/claude/poly55/owlymarket/supabase/migrations/20251230_change_user_id_to_text.sql',
    note: 'Supabase does not allow direct SQL execution via API for security reasons'
  })
}
