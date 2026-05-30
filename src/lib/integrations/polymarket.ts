/**
 * Polymarket API integration
 */

import { fetchWithTimeout } from '@/lib/utils/api'
import { MARKET_API_TIMEOUT_MS } from '@/config/constants'
import {
  POLYMARKET_COLLATERAL_SYMBOL,
  POLYMARKET_GAMMA_API_BASE,
  type PolymarketCollateralSymbol,
} from '@/config/market-endpoints'

const GAMMA_API_BASE = POLYMARKET_GAMMA_API_BASE

export interface PolymarketMarket {
  id: string
  question: string
  description?: string
  end_date_iso: string
  outcomes: string[]
  outcome_prices: string[]
  volume: string
  liquidity: string
  collateral_symbol?: PolymarketCollateralSymbol
  image?: string
}

export interface PolymarketEvent {
  id: string
  slug: string
  title: string
  description: string
  endDate: string
  volume: number
  liquidity: number
  markets: Array<{
    id: string
    question: string
    conditionId: string
    outcomes: string
    outcomePrices: string
    volume: string
    active: boolean
    closed: boolean
    collateralSymbol?: PolymarketCollateralSymbol
  }>
}

export const POLYMARKET_COLLATERAL = POLYMARKET_COLLATERAL_SYMBOL

/**
 * Fetch event by slug (from URL)
 */
export async function getPolymarketEvent(
  slug: string
): Promise<PolymarketEvent | null> {
  try {
    const response = await fetchWithTimeout(
      `${GAMMA_API_BASE}/events?slug=${encodeURIComponent(slug)}`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const events = await response.json()
    return events && events.length > 0 ? events[0] : null
  } catch (error) {
    console.error('Error fetching Polymarket event:', error)
    throw error
  }
}

/**
 * Fetch market by condition ID (legacy - kept for compatibility)
 */
export async function getPolymarketMarket(
  conditionId: string
): Promise<PolymarketMarket | null> {
  try {
    const response = await fetchWithTimeout(
      `${GAMMA_API_BASE}/markets/${conditionId}`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Polymarket market:', error)
    throw error
  }
}

/**
 * Search markets by query
 */
export async function searchPolymarketMarkets(
  query: string,
  limit = 10
): Promise<PolymarketMarket[]> {
  try {
    const response = await fetchWithTimeout(
      `${GAMMA_API_BASE}/markets?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        timeout: MARKET_API_TIMEOUT_MS,
      }
    )

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching Polymarket markets:', error)
    return []
  }
}

/**
 * Parse Polymarket URL to extract market ID
 */
export function parsePolymarketUrl(url: string): string | null {
  const match = url.match(/\/event\/([\w-]+)/)
  return match ? match[1] : null
}

/**
 * Get current market probability from event
 */
export function getCurrentProbabilityFromEvent(event: PolymarketEvent): number {
  // Find the most active market
  const activeMarket = event.markets.find(m => m.active && !m.closed)

  if (!activeMarket) {
    // If no active markets, try to find any market with prices
    const anyMarket = event.markets[0]
    if (!anyMarket) return 0.5

    try {
      const prices = JSON.parse(anyMarket.outcomePrices)
      return parseFloat(prices[0]) || 0.5
    } catch {
      return 0.5
    }
  }

  try {
    const prices = JSON.parse(activeMarket.outcomePrices)
    // Assuming binary market, take first outcome (Yes) price
    return parseFloat(prices[0]) || 0.5
  } catch (error) {
    console.error('Error parsing outcome prices:', error)
    return 0.5
  }
}

/**
 * Get current market probability (legacy - for PolymarketMarket)
 */
export function getCurrentProbability(market: PolymarketMarket): number {
  if (!market.outcome_prices || market.outcome_prices.length === 0) {
    return 0.5 // Default to 50% if no data
  }

  // Assuming binary market, take first outcome price
  const yesPrice = parseFloat(market.outcome_prices[0])
  return yesPrice || 0.5
}
