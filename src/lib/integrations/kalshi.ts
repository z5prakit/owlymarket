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
  status: 'open' | 'closed' | 'settled'
  yes_price: number
  no_price: number
  volume: number
  open_time: string
  close_time: string
  expiration_time: string
}

/**
 * Fetch market by ticker
 */
export async function getKalshiMarket(
  ticker: string
): Promise<KalshiMarket | null> {
  try {
    const response = await fetchWithTimeout(
      `${KALSHI_API_BASE}/markets/${ticker}`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Kalshi API error: ${response.status}`)
    }

    const data = await response.json()
    return data.market
  } catch (error) {
    console.error('Error fetching Kalshi market:', error)
    throw error
  }
}

/**
 * Parse Kalshi URL to extract ticker
 */
export function parseKalshiUrl(url: string): string | null {
  const match = url.match(/\/markets\/([\w-]+)/)
  return match ? match[1] : null
}

/**
 * Get current market probability from Kalshi prices
 */
export function getCurrentProbability(market: KalshiMarket): number {
  // Kalshi prices are in cents (0-100)
  return (market.yes_price || 50) / 100
}
