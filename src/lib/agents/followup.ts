/**
 * Follow-up Agent - Fills research gaps
 */

import { z } from 'zod'
import { callOpenAIStructured } from '@/lib/integrations/openai'
import { searchWithValyu, fallbackWebSearch } from '@/lib/integrations/valyu'
import type { FollowUpInput, FollowUpOutput } from '@/types/agents'

const FollowUpSchema = z.object({
  additional_evidence: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      url: z.string().nullable(),
      excerpt: z.string(),
      relevance_score: z.number().min(0).max(1),
    })
  ),
})

const SYSTEM_PROMPT = `You are a follow-up researcher filling gaps in analysis.

Your task:
1. Address specific research gaps
2. Find targeted, high-quality evidence
3. Focus on missing perspectives
4. Strengthen weak areas

Prioritize credible, recent sources.`

export async function runFollowUpAgent(
  input: FollowUpInput
): Promise<FollowUpOutput> {
  if (input.gaps.length === 0) {
    return { additional_evidence: [] }
  }

  const searchResults = []

  // Search for each gap
  for (const gap of input.gaps.slice(0, 3)) {
    const valyuResults = await searchWithValyu(gap, { maxResults: 2 })

    if (valyuResults.length > 0) {
      searchResults.push(...valyuResults)
    } else {
      const webResults = await fallbackWebSearch(gap)
      searchResults.push(...webResults)
    }
  }

  const userPrompt = `Research Question: ${input.research_question}

Identified Gaps:
${input.gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Search Results:
${searchResults.map((r, i) => `${i + 1}. ${r.title}\n${r.snippet}`).join('\n\n')}

Extract evidence addressing these gaps.`

  const result = await callOpenAIStructured<FollowUpOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    FollowUpSchema,
    'followup_output'
  )

  return result
}
