/**
 * POST /api/admin/add-columns - Add progress columns to database
 * This is a one-time migration endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const serverClient = createServerClient()

    console.log('[AddColumns] Checking if columns exist...')

    // Test if columns exist
    const { error: testError } = await serverClient
      .from('analyses')
      .select('progress_step, progress_message')
      .limit(1)

    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Columns already exist',
      })
    }

    console.log('[AddColumns] Columns do not exist, adding them...')
    console.log('[AddColumns] Test error:', testError.message)

    // Use raw SQL to add columns
    // Note: Supabase client doesn't support raw SQL directly, so we'll need to use the management API
    return NextResponse.json({
      success: false,
      message: 'Columns need to be added manually. Please run this SQL in Supabase SQL Editor:',
      sql: `
-- Add progress tracking columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS progress_step TEXT,
ADD COLUMN IF NOT EXISTS progress_message TEXT;

-- Add comment
COMMENT ON COLUMN analyses.progress_step IS 'Current step in the analysis process';
COMMENT ON COLUMN analyses.progress_message IS 'Human-readable progress message';
      `.trim(),
      url: 'https://supabase.com/dashboard/project/usqshixzparnmykghtzn/sql/new',
    }, { status: 400 })

  } catch (error) {
    console.error('[AddColumns] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
