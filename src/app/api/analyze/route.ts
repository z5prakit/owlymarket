/**
 * POST /api/analyze - Create new analysis with x402 payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverCreateAnalysis, serverUpdateAnalysis, getUserDailyAnalysesCount, isPaymentTransactionUsed, recordPaymentTransaction } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/client'
import { runAgentOrchestration } from '@/lib/agents/orchestrator'
import { getPolymarketEvent, parsePolymarketUrl, getCurrentProbabilityFromEvent } from '@/lib/integrations/polymarket'
import { getKalshiMarket, parseKalshiUrl, getCurrentProbability as getKalshiProb } from '@/lib/integrations/kalshi'
import { detectMarketSource, extractMarketId } from '@/lib/utils/validation'
import { handleAPIError, AuthError, ValidationError, RateLimitError } from '@/lib/utils/errors'
import { FREE_TIER_LIMIT } from '@/config/constants'
import { generatePaymentRequirement, verifyPayment, parsePaymentHeader } from '@/lib/payment/x402'
import { getPrivyUserId } from '@/lib/privy/auth-server'
import crypto from 'crypto'

const ENABLE_PAYMENTS = process.env.NEXT_PUBLIC_ENABLE_REAL_PAYMENTS === 'true'

export async function POST(request: NextRequest) {
  try {
    console.log('[API /analyze] Received request')
    const body = await request.json()
    const { market_url } = body
    console.log('[API /analyze] Market URL:', market_url)

    if (!market_url) {
      throw new ValidationError('market_url is required')
    }

    // Detect market source
    const source = detectMarketSource(market_url)
    console.log('[API /analyze] Market source:', source)
    if (!source) {
      throw new ValidationError('Invalid market URL. Must be Polymarket or Kalshi.')
    }

    // Get authenticated user
    let userId = await getPrivyUserId(request)

    // TEMPORARY: Allow anonymous testing without authentication
    if (!userId) {
      userId = 'anonymous-test-user'
      console.log('[API /analyze] Using anonymous user for testing')
    }

    console.log('[API /analyze] User ID:', userId)

    // Ensure user exists in database
    const serverClient = createServerClient()
    const { data: existingUser } = await serverClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      console.log('[API /analyze] Creating new user:', userId)
      // @ts-ignore - Supabase generated types issue
      await serverClient
        .from('users')
        .insert({
          id: userId,
          subscription_tier: 'free',
          analyses_count: 0,
        })
    }

    // Check daily rate limit (2 analyses per day)
    const dailyCount = await getUserDailyAnalysesCount(userId)
    console.log('[API /analyze] Daily analyses count:', dailyCount, '/', FREE_TIER_LIMIT)

    if (dailyCount >= FREE_TIER_LIMIT) {
      // User exceeded free tier
      if (ENABLE_PAYMENTS) {
        // Check if payment header exists
        const paymentHeader = request.headers.get('X-Payment')

        if (!paymentHeader) {
          // Return 402 Payment Required with x402 payment details
          console.log('[API /analyze] Free tier exceeded, requesting payment')
          const paymentDetails = generatePaymentRequirement(userId)
          return NextResponse.json(paymentDetails, { status: 402 })
        }

        // Verify payment
        console.log('[API /analyze] Verifying payment...')
        const txHash = parsePaymentHeader(paymentHeader)
        if (!txHash) {
          throw new ValidationError('Invalid payment transaction hash format')
        }

        const paymentProof = await verifyPayment(
          txHash,
          userId,
          async (hash) => await isPaymentTransactionUsed(hash)
        )

        if (!paymentProof) {
          throw new ValidationError(
            'Payment verification failed. Please ensure you sent exactly $10 USDC to the correct address on Base network within the last 24 hours.'
          )
        }

        // Record payment transaction
        await recordPaymentTransaction({
          tx_hash: txHash,
          from_address: paymentProof.from,
          to_address: paymentProof.to,
          amount: paymentProof.amount,
          currency: 'USDC',
          network: 'base',
          chain_id: 8453,
          block_number: Number(paymentProof.blockNumber),
          tx_timestamp: new Date(paymentProof.timestamp * 1000),
        })

        console.log('[API /analyze] ✓ Payment verified:', txHash, 'amount:', paymentProof.amount, 'USDC')
        // Payment verified, continue to create analysis
      } else {
        throw new RateLimitError(
          `You've used all ${FREE_TIER_LIMIT} free analyses today. Come back tomorrow!`
        )
      }
    }

    // Extract market ID/slug
    const marketId = extractMarketId(market_url)

    // Fetch market data
    let marketData: any
    let currentProbability = 0.5

    if (source === 'polymarket') {
      // Use slug instead of conditionId
      const slug = parsePolymarketUrl(market_url)
      if (!slug) {
        throw new ValidationError('Could not parse Polymarket URL')
      }

      const event = await getPolymarketEvent(slug)
      if (!event) {
        throw new ValidationError('Market not found on Polymarket')
      }

      marketData = {
        title: event.title,
        description: event.description,
        close_date: event.endDate,
        volume: event.volume,
      }
      currentProbability = getCurrentProbabilityFromEvent(event)
    } else if (source === 'kalshi') {
      const market = await getKalshiMarket(marketId!)
      if (!market) {
        throw new ValidationError('Market not found on Kalshi')
      }
      marketData = {
        title: market.title,
        description: market.subtitle,
        close_date: market.close_time,
        volume: market.volume,
      }
      currentProbability = getKalshiProb(market)
    }

    // Create analysis record (using server client to bypass RLS)
    const analysis = await serverCreateAnalysis({
      user_id: userId,
      market_url,
      market_source: source,
      market_id: marketId,
      market_title: marketData.title,
    })

    // Start async analysis (don't wait)
    // In production, use a queue like BullMQ or Inngest
    performAnalysis(analysis.id, market_url, {
      ...marketData,
      current_probability: currentProbability,
    }).catch(console.error)

    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      created_at: analysis.created_at,
    }, { status: 201 })

  } catch (error) {
    return handleAPIError(error)
  }
}

// Background analysis job
async function performAnalysis(
  analysisId: string,
  marketUrl: string,
  marketData: any
) {
  try {
    // Update status to processing
    await serverUpdateAnalysis(analysisId, { status: 'processing' })

    // Run agent orchestration with progress tracking
    const result = await runAgentOrchestration({
      market_url: marketUrl,
      market_data: marketData,
      analysis_id: analysisId,
      onProgress: async (step: string, message: string) => {
        try {
          await serverUpdateAnalysis(analysisId, {
            progress_step: step,
            progress_message: message,
          })
          console.log(`[Analysis ${analysisId}] Progress: ${step} - ${message}`)
        } catch (err) {
          console.error(`[Analysis ${analysisId}] Failed to update progress:`, err)
        }
      },
    })

    // Save all results in ONE update to ensure atomicity
    console.log(`[Analysis ${analysisId}] Saving results to database...`)
    console.log(`[Analysis ${analysisId}] Report data size:`, JSON.stringify(result.final_report).length, 'bytes')

    try {
      // Update everything at once to avoid race conditions
      const updateResult = await serverUpdateAnalysis(analysisId, {
        status: 'completed',
        market_title: marketData.title,
        report_json: result.final_report.structured_data,
      })

      console.log(`[Analysis ${analysisId}] ✓ Updated all fields`)
      console.log(`[Analysis ${analysisId}] Verify - status:`, updateResult.status)
      console.log(`[Analysis ${analysisId}] Verify - has report_json:`, updateResult.report_json !== null && updateResult.report_json !== undefined)
      console.log(`[Analysis ${analysisId}] Successfully saved to database`)
      console.log(`[Analysis ${analysisId}] Completed in ${result.execution_time}s`)
    } catch (saveError) {
      console.error(`[Analysis ${analysisId}] FATAL: Failed to save results:`, saveError)
      throw saveError
    }
  } catch (error) {
    console.error(`[Analysis ${analysisId}] Failed:`, error)

    await serverUpdateAnalysis(analysisId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
