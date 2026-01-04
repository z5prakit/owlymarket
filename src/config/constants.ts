/**
 * Application constants
 */

// Subscription limits
export const FREE_TIER_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '5',
  10
)
export const PREMIUM_PRICE_USDT = parseFloat(
  process.env.NEXT_PUBLIC_PREMIUM_PRICE_USDT || '10'
)

// Feature flags
export const ENABLE_VALYU = process.env.NEXT_PUBLIC_ENABLE_VALYU === 'true'
export const ENABLE_KALSHI = process.env.NEXT_PUBLIC_ENABLE_KALSHI === 'true'
export const ENABLE_REAL_PAYMENTS =
  process.env.NEXT_PUBLIC_ENABLE_REAL_PAYMENTS === 'true'

// Analysis settings - optimized for Vercel Hobby 10s timeout
export const MAX_EVIDENCE_PER_SIDE = 1 // Ultra-fast mode for Hobby plan
export const MIN_EVIDENCE_FOR_HIGH_CONFIDENCE = 1
export const ANALYSIS_TIMEOUT_MS = 8000 // 8 seconds (buffer for Vercel 10s limit)

// API timeouts
export const OPENAI_TIMEOUT_MS = 60000
export const MARKET_API_TIMEOUT_MS = 10000
export const BLOCKCHAIN_TIMEOUT_MS = 30000

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 50

// Status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const

// Evidence grades
export const EVIDENCE_GRADES = ['A', 'B', 'C', 'D', 'F'] as const

// Confidence levels
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const
