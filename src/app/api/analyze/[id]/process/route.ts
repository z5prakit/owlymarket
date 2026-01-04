import { NextRequest, NextResponse } from 'next/server'
import { runAgentOrchestration } from '@/lib/agents/orchestrator'
import { getAnalysisById, serverUpdateAnalysis } from '@/lib/supabase/queries'
import { getPolymarketEvent, parsePolymarketUrl, getCurrentProbabilityFromEvent } from '@/lib/integrations/polymarket'
import { getKalshiMarket, parseKalshiUrl, getCurrentProbability as getKalshiProb } from '@/lib/integrations/kalshi'
import { handleAPIError } from '@/lib/utils/errors'

// Vercel Pro timeout configuration (requires Pro plan - $20/month)
// Hobby plan maxes out at 10 seconds regardless of this setting
export const maxDuration = 300 // 5 minutes (Vercel Pro)
export const dynamic = 'force-dynamic' // Ensure function runs dynamically

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('[API /analyze/:id/process] Processing analysis:', id)

    // Get analysis
    const analysis = await getAnalysisById(id)
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    if (analysis.status !== 'pending' && analysis.status !== 'processing') {
      return NextResponse.json({
        error: 'Analysis already completed or failed',
        status: analysis.status
      }, { status: 400 })
    }

    // Update to processing
    await serverUpdateAnalysis(id, { status: 'processing' })

    // Get market data
    let marketData: any
    let currentProbability: number

    if (analysis.market_source === 'polymarket') {
      const slug = parsePolymarketUrl(analysis.market_url)
      if (!slug) {
        throw new Error('Could not parse Polymarket URL')
      }

      const event = await getPolymarketEvent(slug)
      if (!event) {
        throw new Error('Market not found on Polymarket')
      }

      marketData = {
        title: event.title,
        description: event.description,
        close_date: event.endDate,
        volume: event.volume,
      }
      currentProbability = getCurrentProbabilityFromEvent(event)
    } else if (analysis.market_source === 'kalshi') {
      const ticker = parseKalshiUrl(analysis.market_url)
      if (!ticker) {
        throw new Error('Could not parse Kalshi URL')
      }

      const market = await getKalshiMarket(ticker)
      if (!market) {
        throw new Error('Market not found on Kalshi')
      }

      marketData = {
        title: market.title,
        description: market.subtitle,
        close_date: market.close_time,
        volume: market.open_interest,
      }
      currentProbability = getKalshiProb(market)
    } else {
      throw new Error('Unsupported market source')
    }

    // Run orchestration
    const result = await runAgentOrchestration({
      market_url: analysis.market_url,
      market_data: { ...marketData, current_probability: currentProbability },
      analysis_id: id,
      onProgress: async (step: string, message: string) => {
        console.log(`[Analysis ${id}] Progress: ${step} - ${message}`)
      },
    })

    // Save results
    await serverUpdateAnalysis(id, {
      status: 'completed',
      market_title: marketData.title,
      report_json: result.final_report.structured_data,
    })

    console.log(`[Analysis ${id}] Completed in ${result.execution_time}s`)

    return NextResponse.json({
      status: 'completed',
      execution_time: result.execution_time,
    })

  } catch (error) {
    console.error('[API /analyze/:id/process] Failed with error:', error)
    console.error('[API /analyze/:id/process] Error type:', typeof error)
    console.error('[API /analyze/:id/process] Error name:', error instanceof Error ? error.name : 'N/A')
    console.error('[API /analyze/:id/process] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[API /analyze/:id/process] Error stack:', error instanceof Error ? error.stack : 'N/A')

    // Log full error object for debugging
    if (error instanceof Error && 'cause' in error) {
      console.error('[API /analyze/:id/process] Error cause:', error.cause)
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[API /analyze/:id/process] Storing error message:', errorMessage)

    try {
      await serverUpdateAnalysis(params.id, {
        status: 'failed',
        error_message: errorMessage,
      })
    } catch (updateError) {
      console.error('[API /analyze/:id/process] Failed to update status:', updateError)
    }

    return handleAPIError(error)
  }
}
