/**
 * Con Researcher Agent - Gathers evidence against YES outcome
 */

import { z } from 'zod'
import { callOpenAIStructured } from '@/lib/integrations/openai'
import { searchWithValyu, fallbackWebSearch } from '@/lib/integrations/valyu'
import type { ResearcherInput, ResearcherOutput, RawEvidence } from '@/types/agents'
import { MAX_EVIDENCE_PER_SIDE } from '@/config/constants'

const ResearcherSchema = z.object({
  evidence: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      url: z.string().nullable(),
      excerpt: z.string(),
      relevance_score: z.number().min(0).max(1),
    })
  ),
})

const SYSTEM_PROMPT = `You are a research analyst gathering evidence AGAINST a positive outcome.

Your task:
1. Search for credible evidence opposing the YES outcome
2. Extract specific, verifiable claims
3. Cite sources clearly
4. Rate relevance (0-1)

Focus on:
- Contradicting data
- Challenges and obstacles
- Expert skepticism
- Historical precedents
- Risk factors

Avoid speculation and unverified claims.`

export async function runConResearcherAgent(
  input: ResearcherInput
): Promise<ResearcherOutput> {
  const searchResults: RawEvidence[] = []

  // Try Valyu search first
  for (const query of input.queries.slice(0, 1)) {
    const valyuResults = await searchWithValyu(query, { maxResults: 1 })

    for (const result of valyuResults) {
      searchResults.push({
        claim: result.title,
        source: result.source,
        url: result.url,
        excerpt: result.snippet,
        relevance_score: result.relevance_score,
      })
    }
  }

  // Fallback to web search if needed
  if (searchResults.length === 0) {
    for (const query of input.queries) {
      const webResults = await fallbackWebSearch(query)
      searchResults.push(...webResults.map(r => ({
        claim: r.title,
        source: r.source,
        url: r.url,
        excerpt: r.snippet,
        relevance_score: r.relevance_score,
      })))
    }
  }

  // Use OpenAI to analyze and synthesize findings
  const userPrompt = `Research Question: ${input.research_question}

Search Results:
${searchResults.map((r, i) => `${i + 1}. ${r.claim}\nSource: ${r.source}\n${r.excerpt}\n`).join('\n')}

Extract ${Math.min(MAX_EVIDENCE_PER_SIDE, 3)} pieces of evidence that OPPOSE the positive outcome.`

  const result = await callOpenAIStructured<ResearcherOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    ResearcherSchema,
    'researcher_output',
    'gpt-4o-mini' // Faster model for research
  )

  return result
}
