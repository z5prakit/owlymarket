/**
 * Reporter Agent - Generates final analysis report
 */

import { z } from 'zod'
import { callOpenAIStructured } from '@/lib/integrations/openai'
import type { ReporterInput, ReporterOutput } from '@/types/agents'
import { calculateConfidence } from '@/lib/utils/bayesian'

const GradedEvidenceSchema = z.object({
  claim: z.string(),
  source: z.string(),
  url: z.string().nullable(),
  excerpt: z.string().nullable(),
  quality_grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  supports_outcome: z.enum(['yes', 'no', 'pro', 'con']),
  confidence: z.number(),
  reasoning: z.string(),
})

const AnalystOutputSchema = z.object({
  prior: z.number(),
  raw_posterior: z.number(),
  adjusted_posterior: z.number(),
  confidence_interval: z.array(z.number()).length(2),
  explanation: z.string(),
})

const ReporterSchema = z.object({
  markdown_report: z.string(),
  structured_data: z.object({
    final_prediction: z.object({
      probability: z.number().min(0).max(1),
      confidence: z.enum(['high', 'medium', 'low']),
      recommendation: z.string(),
    }),
  }),
})

const SYSTEM_PROMPT = `You are a financial analyst creating a comprehensive market analysis report.

Create a well-structured markdown report with:
1. Executive Summary
2. Market Overview
3. Key Evidence (Pro/Con)
4. Probability Analysis
5. Final Recommendation

Be clear, concise, and actionable. Use professional tone.`

export async function runReporterAgent(
  input: ReporterInput
): Promise<ReporterOutput> {
  const proEvidence = input.evidence.filter(e => e.supports_outcome === 'yes' || e.supports_outcome === 'pro')
  const conEvidence = input.evidence.filter(e => e.supports_outcome === 'no' || e.supports_outcome === 'con')

  const userPrompt = `Market: ${input.market_data.title}

Analysis Results:
- Prior Probability: ${(input.analysis.prior * 100).toFixed(1)}%
- Posterior Probability: ${(input.analysis.adjusted_posterior * 100).toFixed(1)}%
- Confidence Interval: ${(input.analysis.confidence_interval[0] * 100).toFixed(1)}% - ${(input.analysis.confidence_interval[1] * 100).toFixed(1)}%

Evidence Summary:
Pro Evidence (${proEvidence.length}):
${proEvidence.slice(0, 5).map(e => `- [${e.quality_grade}] ${e.claim}`).join('\n')}

Con Evidence (${conEvidence.length}):
${conEvidence.slice(0, 5).map(e => `- [${e.quality_grade}] ${e.claim}`).join('\n')}

Generate comprehensive analysis report.`

  const confidenceLevel = calculateConfidence(input.evidence)

  const result = await callOpenAIStructured<ReporterOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    ReporterSchema,
    'reporter_output',
    'gpt-4o-mini' // Faster model
  )

  // Ensure structured data matches our requirements with full data for frontend
  result.structured_data = {
    market_data: {
      title: input.market_data.title,
      description: input.market_data.description,
      close_date: input.market_data.close_date,
      volume: input.market_data.volume,
      current_probability: input.market_data.current_probability,
    },
    evidence: input.evidence,
    probability_analysis: {
      prior: input.analysis.prior,
      raw_posterior: input.analysis.raw_posterior,
      adjusted_posterior: input.analysis.adjusted_posterior,
      confidence_interval: input.analysis.confidence_interval,
      explanation: input.analysis.explanation,
    },
    final_prediction: {
      probability: input.analysis.adjusted_posterior,
      confidence: confidenceLevel,
      recommendation: result.structured_data.final_prediction.recommendation,
    },
  }

  return result
}
