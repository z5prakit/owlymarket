// Main type exports for OwlyMarket

export * from './api'
export * from './agents'
export * from './blockchain'

// Database types (will be auto-generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          email: string | null
          subscription_tier: 'free' | 'premium'
          subscription_expires_at: string | null
          analyses_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          email?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_expires_at?: string | null
          analyses_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          email?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_expires_at?: string | null
          analyses_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string | null
          market_url: string
          market_source: 'polymarket' | 'kalshi'
          market_id: string | null
          market_title: string | null
          report_json: Record<string, any>
          status: 'pending' | 'processing' | 'completed' | 'failed'
          progress_step: string | null
          progress_message: string | null
          error_message: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          market_url: string
          market_source: 'polymarket' | 'kalshi'
          market_id?: string | null
          market_title?: string | null
          report_json?: Record<string, any>
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          progress_step?: string | null
          progress_message?: string | null
          error_message?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          market_url?: string
          market_source?: 'polymarket' | 'kalshi'
          market_id?: string | null
          market_title?: string | null
          report_json?: Record<string, any>
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          progress_step?: string | null
          progress_message?: string | null
          error_message?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          tx_hash: string
          amount: number
          currency: string
          chain: string
          status: 'pending' | 'confirmed' | 'failed'
          verified_at: string | null
          subscription_months: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          tx_hash: string
          amount: number
          currency?: string
          chain?: string
          status?: 'pending' | 'confirmed' | 'failed'
          verified_at?: string | null
          subscription_months?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          tx_hash?: string
          amount?: number
          currency?: string
          chain?: string
          status?: 'pending' | 'confirmed' | 'failed'
          verified_at?: string | null
          subscription_months?: number
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Analysis = Database['public']['Tables']['analyses']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
