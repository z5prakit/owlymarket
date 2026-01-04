/**
 * POST /api/analyze - Create new analysis with x402 payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverCreateAnalysis, getUserDailyAnalysesCount, isPaymentTransactionUsed, recordPaymentTransaction } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/client'
import { getPolymarketEvent, parsePolymarketUrl, getCurrentProbabilityFromEvent } from '@/lib/integrations/polymarket'
import { getKalshiMarket, parseKalshiUrl, getCurrentProbability as getKalshiProb } from '@/lib/integrations/kalshi'
import { detectMarketSource, extractMarketId } from '@/lib/utils/validation'
import { handleAPIError, ValidationError, RateLimitError } from '@/lib/utils/errors'
import { FREE_TIER_LIMIT } from '@/config/constants'
import { generatePaymentRequirement, verifyPayment, parsePaymentHeader } from '@/lib/payment/x402'
import { getPrivyUserId } from '@/lib/privy/auth-server'

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

    // Get authenticated user (optional during testing phase)
    let userId = await getPrivyUserId(request)

    // TESTING PHASE: Allow anonymous access without wallet connection
    // When authentication is ready, remove this section
    if (!userId) {
      console.log('[API /analyze] No authentication - using anonymous user')
      userId = 'anonymous-user'
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

    // TESTING PHASE: Skip rate limiting for anonymous users
    // When authentication is ready, enable rate limiting for all users
    if (userId !== 'anonymous-user') {
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
    } else {
      console.log('[API /analyze] Anonymous user - skipping rate limit check')
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
      const ticker = parseKalshiUrl(market_url)
      console.log('[API /analyze] Parsed Kalshi ticker:', ticker)
      if (!ticker) {
        throw new ValidationError('Could not parse Kalshi URL')
      }

      console.log('[API /analyze] Fetching Kalshi market with ticker:', ticker)
      const market = await getKalshiMarket(ticker)
      console.log('[API /analyze] Kalshi market response:', market ? 'Found' : 'Not found')
      if (!market) {
        throw new ValidationError('Market not found on Kalshi')
      }
      marketData = {
        title: market.title,
        description: market.subtitle,
        close_date: market.close_time,
        volume: market.open_interest,
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

    console.log('[API /analyze] Created analysis:', analysis.id)
    console.log('[API /analyze] Analysis will be processed by cron job')

    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      created_at: analysis.created_at,
      message: 'Analysis queued. Will be processed within 1 minute.',
    }, { status: 201 })

  } catch (error) {
    return handleAPIError(error)
  }
}
