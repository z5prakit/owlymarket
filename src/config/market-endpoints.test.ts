import { describe, expect, it } from 'vitest'
import {
  KALSHI_TRADE_API_BASE,
  POLYMARKET_CLOB_API_BASE,
  POLYMARKET_COLLATERAL_SYMBOL,
  POLYMARKET_DATA_API_BASE,
  POLYMARKET_ENDPOINTS,
  POLYMARKET_GAMMA_API_BASE,
} from './market-endpoints'

describe('market endpoints', () => {
  it('uses current Polymarket public API hosts', () => {
    expect(POLYMARKET_ENDPOINTS).toEqual({
      gamma: POLYMARKET_GAMMA_API_BASE,
      clob: POLYMARKET_CLOB_API_BASE,
      data: POLYMARKET_DATA_API_BASE,
    })
    expect(POLYMARKET_GAMMA_API_BASE).toBe('https://gamma-api.polymarket.com')
    expect(POLYMARKET_CLOB_API_BASE).toBe('https://clob.polymarket.com')
    expect(POLYMARKET_DATA_API_BASE).toBe('https://data-api.polymarket.com')
  })

  it('tracks Polymarket collateral wording as pUSD', () => {
    expect(POLYMARKET_COLLATERAL_SYMBOL).toBe('pUSD')
  })

  it('keeps Kalshi on trade-api v2', () => {
    expect(KALSHI_TRADE_API_BASE).toBe('https://api.elections.kalshi.com/trade-api/v2')
  })
})
