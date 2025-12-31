// AI Agent Types

// Common
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'F'
export type Stance = 'yes' | 'no' | 'pro' | 'con'

// Planner Agent
export interface PlannerInput {
  market_url: string
  market_data: {
    title: string
    description?: string
    current_probability: number
  }
}

export interface PlannerOutput {
  research_question: string
  pro_queries: string[]
  con_queries: string[]
  estimated_time: number
}

// Researcher Agent
export interface ResearcherInput {
  research_question: string
  queries: string[]
  stance: 'pro' | 'con'
}

export interface RawEvidence {
  claim: string
  source: string
  url?: string
  excerpt: string
  relevance_score: number
}

export interface ResearcherOutput {
  evidence: RawEvidence[]
}

// Critic Agent
export interface CriticInput {
  evidence: RawEvidence[]
}

export interface GradedEvidence {
  claim: string
  source: string
  url?: string
  excerpt?: string
  quality_grade: EvidenceGrade
  supports_outcome: Stance
  confidence: number
  reasoning: string
}

export interface CriticOutput {
  graded_evidence: GradedEvidence[]
  gaps: string[]
}

// Follow-up Agent
export interface FollowUpInput {
  gaps: string[]
  research_question: string
}

export interface FollowUpOutput {
  additional_evidence: RawEvidence[]
}

// Analyst Agent
export interface AnalystInput {
  prior_probability: number
  evidence: GradedEvidence[]
}

export interface AnalystOutput {
  prior: number
  raw_posterior: number
  adjusted_posterior: number
  confidence_interval: [number, number]
  explanation: string
  evidence_weights: Record<string, number>
}

// Correlation Agent
export interface CorrelationInput {
  evidence: GradedEvidence[]
  raw_probability: number
}

export interface CorrelationOutput {
  adjusted_probability: number
  redundancy_groups: string[][]
  adjustment_factor: number
}

// Reporter Agent
export interface ReporterInput {
  market_data: PlannerInput['market_data']
  evidence: GradedEvidence[]
  analysis: AnalystOutput
}

export interface ReporterOutput {
  markdown_report: string
  structured_data: {
    market_data: any
    evidence: GradedEvidence[]
    probability_analysis: AnalystOutput
    final_prediction: {
      probability: number
      confidence: 'high' | 'medium' | 'low'
      recommendation: string
    }
  }
}

// Orchestrator
export interface OrchestrationResult {
  market_data: any
  plan: PlannerOutput
  all_evidence: GradedEvidence[]
  analysis: AnalystOutput
  final_report: ReporterOutput
  execution_time: number
}
