/**
 * Bayesian Probability Calculations for Market Analysis
 *
 * Uses logit transformation for additive updates:
 * logit(p) = log(p / (1 - p))
 */

import type { GradedEvidence, EvidenceGrade } from '@/types/agents'

/**
 * Convert evidence quality grade to numeric weight
 */
export function gradeToWeight(grade: EvidenceGrade): number {
  const weights: Record<EvidenceGrade, number> = {
    A: 1.0, // Highly reliable
    B: 0.7, // Good
    C: 0.4, // Moderate
    D: 0.2, // Weak
    F: 0.0, // Failed/Discard
  }
  return weights[grade]
}

/**
 * Convert probability to logit (log-odds)
 */
export function probabilityToLogit(p: number): number {
  // Clamp probability to avoid infinity
  const clamped = Math.max(0.01, Math.min(0.99, p))
  return Math.log(clamped / (1 - clamped))
}

/**
 * Convert logit back to probability
 */
export function logitToProbability(logit: number): number {
  const prob = 1 / (1 + Math.exp(-logit))
  // Clamp to reasonable bounds
  return Math.max(0.01, Math.min(0.99, prob))
}

/**
 * Calculate evidence strength in logit space
 *
 * @param evidence - Graded evidence item
 * @returns Strength value (typically -2 to +2)
 */
export function evidenceStrength(evidence: GradedEvidence): number {
  const baseStrength = evidence.confidence
  const qualityWeight = gradeToWeight(evidence.quality_grade)

  // Scale to logit units (typical range: -2 to +2)
  // Higher confidence and quality = stronger evidence
  const strength = baseStrength * qualityWeight * 4 - 2

  // Flip sign if evidence supports 'no' outcome
  return evidence.supports_outcome === 'yes' || evidence.supports_outcome === 'pro'
    ? strength
    : -strength
}

/**
 * Perform Bayesian update using evidence
 *
 * @param priorProbability - Prior probability (0-1)
 * @param evidenceList - Array of graded evidence
 * @returns Posterior probability (0-1)
 */
export function bayesianUpdate(
  priorProbability: number,
  evidenceList: GradedEvidence[]
): number {
  // Convert prior to logit
  let logit = probabilityToLogit(priorProbability)

  // Accumulate evidence
  for (const evidence of evidenceList) {
    // Skip failed evidence
    if (evidence.quality_grade === 'F') continue

    const strength = evidenceStrength(evidence)
    logit += strength
  }

  // Convert back to probability
  return logitToProbability(logit)
}

/**
 * Group similar evidence for correlation detection
 *
 * Simple implementation: group by source domain
 */
export function groupSimilarEvidence(evidenceList: GradedEvidence[]): GradedEvidence[][] {
  const groups = new Map<string, GradedEvidence[]>()

  for (const evidence of evidenceList) {
    try {
      // Extract domain from source/URL
      const domain = evidence.url
        ? new URL(evidence.url).hostname
        : evidence.source.toLowerCase()

      if (!groups.has(domain)) {
        groups.set(domain, [])
      }
      groups.get(domain)!.push(evidence)
    } catch {
      // If URL parsing fails, use source as-is
      const key = evidence.source.toLowerCase()
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(evidence)
    }
  }

  return Array.from(groups.values())
}

/**
 * Adjust probability for correlated/redundant evidence
 *
 * @param evidenceList - All evidence
 * @param rawProbability - Unadjusted posterior
 * @returns Adjusted probability
 */
export function correlationAdjustment(
  evidenceList: GradedEvidence[],
  rawProbability: number
): number {
  const groups = groupSimilarEvidence(evidenceList)

  let adjustedLogit = probabilityToLogit(rawProbability)

  for (const group of groups) {
    if (group.length > 1) {
      // Diminishing returns for evidence from same source
      const redundancyPenalty = 0.3 * (group.length - 1)
      const groupStrength = group.reduce(
        (sum, e) => sum + evidenceStrength(e),
        0
      )
      adjustedLogit -= groupStrength * redundancyPenalty
    }
  }

  return logitToProbability(adjustedLogit)
}

/**
 * Calculate confidence level based on evidence quality and quantity
 */
export function calculateConfidence(evidenceList: GradedEvidence[]): 'high' | 'medium' | 'low' {
  if (evidenceList.length === 0) return 'low'

  const avgQuality =
    evidenceList.reduce((sum, e) => sum + gradeToWeight(e.quality_grade), 0) /
    evidenceList.length

  const highQualityCount = evidenceList.filter((e) =>
    ['A', 'B'].includes(e.quality_grade)
  ).length

  if (avgQuality >= 0.7 && highQualityCount >= 3) {
    return 'high'
  } else if (avgQuality >= 0.4 || highQualityCount >= 2) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * Calculate confidence interval based on evidence quality
 */
export function calculateConfidenceInterval(
  probability: number,
  evidenceList: GradedEvidence[]
): [number, number] {
  const avgQuality =
    evidenceList.length > 0
      ? evidenceList.reduce(
          (sum, e) => sum + gradeToWeight(e.quality_grade),
          0
        ) / evidenceList.length
      : 0.5

  // Lower quality = wider interval
  const uncertainty = 0.2 * (1 - avgQuality)

  return [
    Math.max(0.01, probability - uncertainty),
    Math.min(0.99, probability + uncertainty),
  ]
}

/**
 * Complete Bayesian analysis
 */
export interface BayesianAnalysisResult {
  prior: number
  raw_posterior: number
  adjusted_posterior: number
  confidence_interval: [number, number]
  confidence_level: 'high' | 'medium' | 'low'
  evidence_count: number
  high_quality_count: number
}

export function performBayesianAnalysis(
  priorProbability: number,
  evidenceList: GradedEvidence[]
): BayesianAnalysisResult {
  const rawPosterior = bayesianUpdate(priorProbability, evidenceList)
  const adjustedPosterior = correlationAdjustment(evidenceList, rawPosterior)
  const confidenceInterval = calculateConfidenceInterval(
    adjustedPosterior,
    evidenceList
  )
  const confidenceLevel = calculateConfidence(evidenceList)

  const highQualityCount = evidenceList.filter((e) =>
    ['A', 'B'].includes(e.quality_grade)
  ).length

  return {
    prior: priorProbability,
    raw_posterior: rawPosterior,
    adjusted_posterior: adjustedPosterior,
    confidence_interval: confidenceInterval,
    confidence_level: confidenceLevel,
    evidence_count: evidenceList.length,
    high_quality_count: highQualityCount,
  }
}
