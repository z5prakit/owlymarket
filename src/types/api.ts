// API Request and Response Types

// Analysis API
export interface CreateAnalysisRequest {
  market_url: string
}

export interface CreateAnalysisResponse {
  id: string
  status: 'pending' | 'processing'
  created_at: string
}

export interface MarketData {
  title: string
  description?: string
  current_probability: number
  close_date: string
  volume?: number
  liquidity?: number
}

export interface Evidence {
  claim: string
  source: string
  url?: string
  excerpt?: string
  quality_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  supports_outcome: 'yes' | 'no'
  confidence: number
  reasoning: string
}

export interface ProbabilityAnalysis {
  prior: number
  raw_posterior: number
  adjusted_posterior: number
  confidence_interval: [number, number]
  explanation?: string
}

export interface FinalPrediction {
  probability: number
  confidence: 'high' | 'medium' | 'low'
  recommendation: string
}

export interface AnalysisReport {
  market_data: MarketData
  evidence: Evidence[]
  probability_analysis: ProbabilityAnalysis
  final_prediction: FinalPrediction
}

export interface GetAnalysisResponse {
  id: string
  market_url: string
  market_source: 'polymarket' | 'kalshi'
  market_title: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress_step: string | null
  progress_message: string | null
  report: AnalysisReport | null
  error_message: string | null
  created_at: string
  updated_at: string
}

// User API
export interface AnalysisHistoryItem {
  id: string
  market_url: string
  market_title: string | null
  status: string
  created_at: string
}

export interface GetHistoryResponse {
  analyses: AnalysisHistoryItem[]
  total: number
  has_more: boolean
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium'
  expires_at: string | null
  analyses_count: number
  analyses_limit: number | null
  is_active: boolean
}

// Payment API
export interface VerifyPaymentRequest {
  tx_hash: string
  amount: string
}

export interface VerifyPaymentResponse {
  success: boolean
  transaction?: {
    id: string
    status: 'confirmed'
    verified_at: string
  }
  subscription?: {
    tier: 'premium'
    expires_at: string
  }
  error?: string
}

// Error Response
export interface APIError {
  error: string
  message: string
  status: number
}
