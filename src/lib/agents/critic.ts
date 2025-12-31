/**
 * Critic Agent - Evaluates evidence quality and identifies gaps
 */

import { z } from 'zod'
import { callOpenAIStructured } from '@/lib/integrations/openai'
import type { CriticInput, CriticOutput } from '@/types/agents'

const CriticSchema = z.object({
  graded_evidence: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      url: z.string().nullable(),
      excerpt: z.string().nullable(),
      quality_grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      supports_outcome: z.enum(['yes', 'no']),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    })
  ),
  gaps: z.array(z.string()),
})

const SYSTEM_PROMPT = `You are a critical evaluator of research evidence.

Grade each piece of evidence (A-F) based on:
- Source credibility (A: Expert/Academic, B: Reputable media, C: General media, D: Questionable, F: Unreliable)
- Recency (newer is better)
- Specificity (concrete data > vague claims)
- Verifiability (can it be checked?)

Also identify:
- Research gaps (what's missing?)
- Contradictions
- Weak areas

Be strict but fair. Quality over quantity.`

export async function runCriticAgent(input: CriticInput): Promise<CriticOutput> {
  const userPrompt = `Evaluate this evidence:

${input.evidence.map((e, i) => `
Evidence #${i + 1}:
Claim: ${e.claim}
Source: ${e.source}
Excerpt: ${e.excerpt}
`).join('\n')}

Grade each piece and identify research gaps.`

  const result = await callOpenAIStructured<CriticOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    CriticSchema,
    'critic_output',
    'gpt-4o-mini' // Faster model
  )

  return result
}
