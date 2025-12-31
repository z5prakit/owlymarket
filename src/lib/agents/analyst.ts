/**
 * Analyst Agent - Performs Bayesian probability analysis
 */

import { performBayesianAnalysis } from '@/lib/utils/bayesian'
import type { AnalystInput, AnalystOutput, GradedEvidence } from '@/types/agents'

export async function runAnalystAgent(input: AnalystInput): Promise<AnalystOutput> {
  const result = performBayesianAnalysis(
    input.prior_probability,
    input.evidence
  )

  // Create evidence weights map
  const evidenceWeights: Record<string, number> = {}
  input.evidence.forEach((e, i) => {
    evidenceWeights[`evidence_${i}`] = e.confidence * (e.quality_grade === 'A' ? 1 : e.quality_grade === 'B' ? 0.7 : 0.4)
  })

  // Generate explanation
  const proCount = input.evidence.filter(e => e.supports_outcome === 'yes' || e.supports_outcome === 'pro').length
  const conCount = input.evidence.length - proCount
  const avgQuality = input.evidence.reduce((sum, e) => {
    const weights = { A: 1, B: 0.7, C: 0.4, D: 0.2, F: 0 }
    return sum + weights[e.quality_grade]
  }, 0) / input.evidence.length

  const explanation = `Analysis of ${input.evidence.length} pieces of evidence (${proCount} supporting, ${conCount} opposing).
Prior probability: ${(input.prior_probability * 100).toFixed(1)}%
Average evidence quality: ${(avgQuality * 100).toFixed(0)}%
Raw posterior: ${(result.raw_posterior * 100).toFixed(1)}%
Adjusted for correlation: ${(result.adjusted_posterior * 100).toFixed(1)}%
Confidence: ${result.confidence_level}`

  return {
    prior: result.prior,
    raw_posterior: result.raw_posterior,
    adjusted_posterior: result.adjusted_posterior,
    confidence_interval: result.confidence_interval,
    explanation,
    evidence_weights: evidenceWeights,
  }
}
