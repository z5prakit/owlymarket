/**
 * Kalshi API integration
 */

import { fetchWithTimeout } from '@/lib/utils/api'
import { MARKET_API_TIMEOUT_MS } from '@/config/constants'

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2'

export interface KalshiMarket {
  ticker: string
  title: string
  subtitle?: string
  status: string // 'active' | 'closed' | 'settled'
  last_price: number // Yes price in cents (0-100)
  yes_bid?: number // Yes bid price in cents (0-100)
  open_interest: number
  liquidity: number
  open_time: string
  close_time: string
  expiration_time: string
}

/**
 * Fetch markets from a series ticker
 */
async function getMarketsFromSeries(
  seriesTicker: string
): Promise<KalshiMarket[]> {
  try {
    const response = await fetchWithTimeout(
      `${KALSHI_API_BASE}/markets?series_ticker=${seriesTicker}&status=open&limit=20`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.markets || []
  } catch (error) {
    console.error('Error fetching Kalshi series markets:', error)
    return []
  }
}

/**
 * Fetch market by ticker
 * If ticker is a series/event, returns the most popular sub-market
 */
export async function getKalshiMarket(
  ticker: string
): Promise<KalshiMarket | null> {
  try {
    // Try fetching as a single market first
    const response = await fetchWithTimeout(
      `${KALSHI_API_BASE}/markets/${ticker}`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.market
    }

    // If 404, try fetching as a series
    if (response.status === 404) {
      console.log(`[Kalshi] ${ticker} not found as single market, trying as series...`)

      // Extract series ticker (e.g., KXNCAAF-26 -> KXNCAAF)
      const seriesTicker = ticker.split('-')[0]
      console.log(`[Kalshi] Extracted series ticker: ${seriesTicker}`)

      const markets = await getMarketsFromSeries(seriesTicker)

      if (markets.length === 0) {
        console.log(`[Kalshi] No markets found in series ${seriesTicker}`)
        return null
      }

      // Return the market with highest yes_bid (most popular)
      const topMarket = markets.reduce((prev, current) => {
        const prevBid = prev.yes_bid || 0
        const currentBid = current.yes_bid || 0
        return currentBid > prevBid ? current : prev
      })

      console.log(`[Kalshi] Found ${markets.length} markets in series, selected: ${topMarket.ticker} (${topMarket.title})`)
      return topMarket
    }

    throw new Error(`Kalshi API error: ${response.status}`)
  } catch (error) {
    console.error('Error fetching Kalshi market:', error)
    throw error
  }
}

/**
 * Parse Kalshi URL to extract ticker
 * Kalshi URLs are in format: /markets/series/event/ticker
 * We need the ticker (last segment) in UPPERCASE
 */
export function parseKalshiUrl(url: string): string | null {
  const match = url.match(/\/markets\/[\w-]+(?:\/[\w-]+)*\/([\w-]+)(?:\?.*)?$/)
  return match ? match[1].toUpperCase() : null
}

/**
 * Get current market probability from Kalshi prices
 */
export function getCurrentProbability(market: KalshiMarket): number {
  // Use yes_bid if available (from series markets), otherwise last_price
  const price = market.yes_bid || market.last_price || 50
  return price / 100
}
