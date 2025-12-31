/**
 * Correlation Agent - Adjusts for redundant evidence
 */

import { correlationAdjustment, groupSimilarEvidence } from '@/lib/utils/bayesian'
import type { CorrelationInput, CorrelationOutput } from '@/types/agents'

export async function runCorrelationAgent(
  input: CorrelationInput
): Promise<CorrelationOutput> {
  const adjustedProbability = correlationAdjustment(
    input.evidence,
    input.raw_probability
  )

  const groups = groupSimilarEvidence(input.evidence)
  const redundancyGroups = groups
    .filter(g => g.length > 1)
    .map(g => g.map(e => e.source))

  const adjustmentFactor = Math.abs(adjustedProbability - input.raw_probability)

  return {
    adjusted_probability: adjustedProbability,
    redundancy_groups: redundancyGroups,
    adjustment_factor: adjustmentFactor,
  }
}
