export const POLYMARKET_GAMMA_API_BASE = 'https://gamma-api.polymarket.com'
export const POLYMARKET_CLOB_API_BASE = 'https://clob.polymarket.com'
export const POLYMARKET_DATA_API_BASE = 'https://data-api.polymarket.com'

export const POLYMARKET_ENDPOINTS = {
  gamma: POLYMARKET_GAMMA_API_BASE,
  clob: POLYMARKET_CLOB_API_BASE,
  data: POLYMARKET_DATA_API_BASE,
} as const

export const POLYMARKET_COLLATERAL_SYMBOL = 'pUSD'

export type PolymarketCollateralSymbol = typeof POLYMARKET_COLLATERAL_SYMBOL

export const KALSHI_TRADE_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2'

export const KALSHI_ENDPOINTS = {
  trade: KALSHI_TRADE_API_BASE,
} as const
