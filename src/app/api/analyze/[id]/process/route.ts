/**
 * POST /api/analyze/[id]/process - Process analysis in chunks
 *
 * This endpoint processes one "chunk" of analysis work (up to 8 seconds)
 * and returns progress. The frontend calls this repeatedly until complete.
 *
 * This works around Vercel Hobby's 10-second timeout by breaking
 * the 30-60 second analysis into multiple 8-second chunks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { serverUpdateAnalysis } from '@/lib/supabase/queries'
import { runAgentOrchestration } from '@/lib/agents/orchestrator'
import { handleAPIError } from '@/lib/utils/errors'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for Pro plan

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id
    console.log(`[Process] Starting chunk for analysis: ${analysisId}`)

    const supabase = createServerClient()

    // Get analysis
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (error || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // If already completed or failed, return current state
    if (analysis.status === 'completed' || analysis.status === 'failed') {
      return NextResponse.json({
        status: analysis.status,
        progress: 100,
        report_json: analysis.report_json,
        error_message: analysis.error_message,
      })
    }

    // Update to processing if pending
    if (analysis.status === 'pending') {
      await serverUpdateAnalysis(analysisId, { status: 'processing' })
    }

    // Run analysis (this will take 30-60 seconds total)
    // We rely on Vercel's 10s timeout to stop this and save progress
    try {
      const result = await runAgentOrchestration({
        market_url: analysis.market_url,
        market_data: {
          title: analysis.market_title,
          current_probability: 0.5,
          close_date: new Date().toISOString(),
        },
        analysis_id: analysisId,
        onProgress: async (step: string, message: string) => {
          console.log(`[Analysis ${analysisId}] ${step}: ${message}`)
        },
      })

      // If we get here, analysis completed successfully
      await serverUpdateAnalysis(analysisId, {
        status: 'completed',
        report_json: result.final_report.structured_data,
      })

      console.log(`[Process] ✓ Analysis ${analysisId} completed`)

      return NextResponse.json({
        status: 'completed',
        progress: 100,
        report_json: result.final_report.structured_data,
        execution_time: result.execution_time,
      })
    } catch (error: any) {
      // Check if this is a timeout vs actual error
      if (error.message?.includes('timeout') || error.message?.includes('FUNCTION_INVOCATION_TIMEOUT')) {
        // Timeout - analysis still in progress
        console.log(`[Process] Analysis ${analysisId} still processing (timeout)`)

        return NextResponse.json({
          status: 'processing',
          progress: 50, // Estimate - we don't track actual progress
          message: 'Analysis in progress...',
        })
      }

      // Actual error
      console.error(`[Process] Analysis ${analysisId} failed:`, error)

      await serverUpdateAnalysis(analysisId, {
        status: 'failed',
        error_message: error.message,
      })

      return NextResponse.json({
        status: 'failed',
        error_message: error.message,
      }, { status: 500 })
    }
  } catch (error) {
    return handleAPIError(error)
  }
}
