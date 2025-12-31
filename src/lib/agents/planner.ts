/**
 * Planner Agent - Creates research strategy
 */

import { z } from 'zod'
import { callOpenAIStructured } from '@/lib/integrations/openai'
import type { PlannerInput, PlannerOutput } from '@/types/agents'

const PlannerSchema = z.object({
  research_question: z.string(),
  pro_queries: z.array(z.string()).length(1),
  con_queries: z.array(z.string()).length(1),
  estimated_time: z.number(),
})

const SYSTEM_PROMPT = `You are a strategic research planner for prediction market analysis.
Your task is to break down a market question into specific research queries.

Create:
1. A clear research question
2. EXACTLY 1 high-quality search query for evidence SUPPORTING the YES outcome
3. EXACTLY 1 high-quality search query for evidence AGAINST the YES outcome
4. Estimated analysis time in seconds

Focus on the MOST IMPORTANT and verifiable sources.`

export async function runPlannerAgent(
  input: PlannerInput
): Promise<PlannerOutput> {
  const userPrompt = `Market Question: ${input.market_data.title}
${input.market_data.description ? `Description: ${input.market_data.description}` : ''}
Current Probability: ${(input.market_data.current_probability * 100).toFixed(1)}%

Create a research strategy to analyze this market.`

  const result = await callOpenAIStructured<PlannerOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    PlannerSchema,
    'planner_output',
    'gpt-4o-mini' // Faster model for planning
  )

  return result
}
