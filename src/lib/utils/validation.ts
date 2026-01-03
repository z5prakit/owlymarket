/**
 * Input validation utilities
 */

import { z } from 'zod'

// Market URL validation (supports query parameters)
const POLYMARKET_REGEX = /^https?:\/\/(www\.)?polymarket\.com\/event\/[\w-]+(\?.*)?$/
const KALSHI_REGEX = /^https?:\/\/(www\.)?kalshi\.com\/markets\/[\w-]+(\/[\w-]+)*(\?.*)?$/

export function isValidMarketUrl(url: string): boolean {
  return POLYMARKET_REGEX.test(url) || KALSHI_REGEX.test(url)
}

export function detectMarketSource(url: string): 'polymarket' | 'kalshi' | null {
  if (POLYMARKET_REGEX.test(url)) return 'polymarket'
  if (KALSHI_REGEX.test(url)) return 'kalshi'
  return null
}

export function extractMarketId(url: string): string | null {
  const source = detectMarketSource(url)

  if (source === 'polymarket') {
    const match = url.match(/\/event\/([\w-]+)/)
    return match ? match[1] : null
  }

  if (source === 'kalshi') {
    const match = url.match(/\/markets\/([\w-]+(?:\/[\w-]+)*)/)
    return match ? match[1] : null
  }

  return null
}

// Zod schemas for API validation
export const createAnalysisSchema = z.object({
  market_url: z.string().url().refine(isValidMarketUrl, {
    message: 'Must be a valid Polymarket or Kalshi market URL',
  }),
})

export const verifyPaymentSchema = z.object({
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
})

// Wallet address validation
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Email validation
export const emailSchema = z.string().email()

// Validate analysis report structure
export const analysisReportSchema = z.object({
  market_data: z.object({
    title: z.string(),
    current_probability: z.number().min(0).max(1),
    close_date: z.string(),
    volume: z.number().optional(),
  }),
  evidence: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      quality_grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      supports_outcome: z.enum(['yes', 'no']),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    })
  ),
  probability_analysis: z.object({
    prior: z.number().min(0).max(1),
    raw_posterior: z.number().min(0).max(1),
    adjusted_posterior: z.number().min(0).max(1),
    confidence_interval: z.tuple([z.number(), z.number()]),
  }),
  final_prediction: z.object({
    probability: z.number().min(0).max(1),
    confidence: z.enum(['high', 'medium', 'low']),
    recommendation: z.string(),
  }),
})
