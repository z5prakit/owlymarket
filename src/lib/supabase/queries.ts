/**
 * Supabase database queries
 */

import { supabase, createServerClient } from './client'
import type { Analysis, User, Transaction } from '@/types'

// ============================================
// USER QUERIES
// ============================================

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as User
}

export async function getUserByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as User | null
}

export async function createUser(user: {
  wallet_address?: string
  email?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function updateUserSubscription(
  userId: string,
  tier: 'free' | 'premium',
  expiresAt: string | null
) {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

// ============================================
// ANALYSIS QUERIES
// ============================================

export async function getAnalysis(id: string) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Analysis
}

// Alias for consistency
export const getAnalysisById = getAnalysis

export async function getUserAnalyses(
  userId: string,
  limit = 10,
  offset = 0
) {
  const { data, error, count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { analyses: data as Analysis[], total: count || 0 }
}

// Get daily analysis count for rate limiting
export async function getUserDailyAnalysesCount(userId: string): Promise<number> {
  try {
    const serverClient = createServerClient()
    console.log('[getUserDailyAnalysesCount] Created server client')

    // Get count of analyses created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log('[getUserDailyAnalysesCount] Querying for user:', userId, 'since:', today.toISOString())

    const { count, error } = await serverClient
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    if (error) {
      console.error('[getUserDailyAnalysesCount] Supabase error full object:', JSON.stringify(error, null, 2))
      console.error('[getUserDailyAnalysesCount] Error details:', error.details)
      console.error('[getUserDailyAnalysesCount] Error hint:', error.hint)
      console.error('[getUserDailyAnalysesCount] Error code:', error.code)
      throw new Error(`Supabase query error: ${error.details || error.hint || error.code || error.message || 'Unknown error'}`)
    }

    console.log('[getUserDailyAnalysesCount] Count:', count)
    return count || 0
  } catch (err) {
    console.error('[getUserDailyAnalysesCount] Unexpected error:', err)
    throw err
  }
}

export async function getPublicAnalyses(limit = 10, offset = 0) {
  const { data, error, count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { analyses: data as Analysis[], total: count || 0 }
}

export async function createAnalysis(analysis: {
  user_id: string
  market_url: string
  market_source: 'polymarket' | 'kalshi'
  market_id?: string
  market_title?: string
}) {
  const { data, error } = await supabase
    .from('analyses')
    .insert(analysis)
    .select()
    .single()

  if (error) throw error
  return data as Analysis
}

// Server-side version (bypasses RLS)
export async function serverCreateAnalysis(analysis: {
  user_id: string
  market_url: string
  market_source: 'polymarket' | 'kalshi'
  market_id?: string
  market_title?: string
}) {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from('analyses')
    .insert(analysis)
    .select()
    .single()

  if (error) {
    console.error('API Error:', error)
    throw error
  }
  return data as Analysis
}

export async function updateAnalysis(
  id: string,
  updates: Partial<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    report_json: Record<string, any>
    error_message: string
    market_title: string
  }>
) {
  const { data, error } = await supabase
    .from('analyses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Analysis
}

// ============================================
// TRANSACTION QUERIES
// ============================================

export async function getTransaction(txHash: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('tx_hash', txHash)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Transaction | null
}

export async function createTransaction(transaction: {
  user_id: string
  tx_hash: string
  amount: number
  currency?: string
  chain?: string
  subscription_months?: number
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function updateTransaction(
  id: string,
  updates: {
    status: 'confirmed' | 'failed'
    verified_at?: string
  }
) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function getUserTransactions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Transaction[]
}

// ============================================
// SERVER-SIDE QUERIES (with service role)
// ============================================

export async function serverGetAnalysis(id: string) {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Analysis | null
}

export async function serverUpdateAnalysis(
  id: string,
  updates: Partial<Analysis>
) {
  const serverClient = createServerClient()

  console.log(`[serverUpdateAnalysis] Updating analysis ${id}`)
  console.log(`[serverUpdateAnalysis] Updates keys:`, Object.keys(updates))

  // Log report_json size if present
  if (updates.report_json) {
    const jsonSize = JSON.stringify(updates.report_json).length
    console.log(`[serverUpdateAnalysis] report_json size: ${jsonSize} bytes`)
    console.log(`[serverUpdateAnalysis] report_json keys:`, Object.keys(updates.report_json))
  }

  const { data, error } = await serverClient
    .from('analyses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`[serverUpdateAnalysis] ERROR CODE:`, error.code)
    console.error(`[serverUpdateAnalysis] ERROR MESSAGE:`, error.message)
    console.error(`[serverUpdateAnalysis] ERROR DETAILS:`, error.details)
    console.error(`[serverUpdateAnalysis] ERROR HINT:`, error.hint)
    console.error(`[serverUpdateAnalysis] FULL ERROR:`, JSON.stringify(error, null, 2))
    throw error
  }

  console.log(`[serverUpdateAnalysis] Success! Record ID:`, data.id)
  console.log(`[serverUpdateAnalysis] Success! Status:`, data.status)
  console.log(`[serverUpdateAnalysis] Success! Has report_json:`, data.report_json !== null)
  return data as Analysis
}

// Get all analyses (for dashboard)
export async function serverGetAllAnalyses(limit = 50, offset = 0) {
  const serverClient = createServerClient()

  const { data, error, count } = await serverClient
    .from('analyses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { analyses: data as Analysis[], total: count || 0 }
}

// ============================================
// PAYMENT QUERIES
// ============================================

// Check if payment transaction hash already used
export async function isPaymentTransactionUsed(txHash: string): Promise<boolean> {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from('payment_transactions')
    .select('id')
    .eq('tx_hash', txHash)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking payment transaction:', error)
    return false
  }

  return data !== null
}

// Record payment transaction
export async function recordPaymentTransaction(payment: {
  tx_hash: string
  from_address: string
  to_address: string
  amount: string
  currency?: string
  network?: string
  chain_id?: number
  block_number: number
  tx_timestamp: Date
  analysis_id?: string
}) {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from('payment_transactions')
    .insert({
      tx_hash: payment.tx_hash,
      from_address: payment.from_address,
      to_address: payment.to_address,
      amount: payment.amount,
      currency: payment.currency || 'USDC',
      network: payment.network || 'base',
      chain_id: payment.chain_id || 8453,
      block_number: payment.block_number,
      tx_timestamp: payment.tx_timestamp.toISOString(),
      analysis_id: payment.analysis_id || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording payment transaction:', error)
    throw error
  }

  return data
}
