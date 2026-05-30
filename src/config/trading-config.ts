export const REAL_TRADING_ENABLED = false

export const TRADING_CONFIG = {
  realTradingEnabled: REAL_TRADING_ENABLED,
  mode: 'analysis-only',
  reason: 'OwlyMarket reads public prediction-market data and does not place real trades.',
} as const

export function assertRealTradingDisabled() {
  if (REAL_TRADING_ENABLED) {
    throw new Error('REAL_TRADING_ENABLED must remain false for analysis-only mode.')
  }

  return TRADING_CONFIG
}
