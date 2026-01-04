/**
 * Vercel Cron Job - Process pending analyses
 * Runs every minute to pick up and process pending analyses
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-analyses",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { serverUpdateAnalysis } from '@/lib/supabase/queries'
import { runAgentOrchestration } from '@/lib/agents/orchestrator'

export const maxDuration = 300 // 5 minutes (Vercel Hobby max for cron)

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Checking for pending analyses...')

    const supabase = createServerClient()

    // Get oldest pending analysis
    const { data: pending } = await supabase
      .from('analyses')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!pending) {
      console.log('[Cron] No pending analyses')
      return NextResponse.json({ message: 'No pending analyses' })
    }

    console.log(`[Cron] Processing analysis: ${pending.id}`)

    // Update to processing
    await serverUpdateAnalysis(pending.id, { status: 'processing' })

    // Run analysis
    try {
      const result = await runAgentOrchestration({
        market_url: pending.market_url,
        market_data: {
          title: pending.market_title,
          current_probability: 0.5,
          close_date: new Date().toISOString(),
        },
        analysis_id: pending.id,
        onProgress: async (step: string, message: string) => {
          console.log(`[Analysis ${pending.id}] ${step}: ${message}`)
        },
      })

      // Save results
      await serverUpdateAnalysis(pending.id, {
        status: 'completed',
        report_json: result.final_report.structured_data,
      })

      console.log(`[Cron] ✓ Analysis ${pending.id} completed in ${result.execution_time}s`)

      return NextResponse.json({
        message: 'Analysis completed',
        id: pending.id,
        execution_time: result.execution_time,
      })
    } catch (analysisError: any) {
      console.error(`[Cron] Analysis ${pending.id} failed:`, analysisError)

      await serverUpdateAnalysis(pending.id, {
        status: 'failed',
        error_message: analysisError.message,
      })

      return NextResponse.json({
        message: 'Analysis failed',
        id: pending.id,
        error: analysisError.message,
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[Cron] Error:', error)
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}
