/**
 * OpenAI API integration
 */

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { retryWithBackoff } from '@/lib/utils/api'
import { OPENAI_TIMEOUT_MS } from '@/config/constants'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey,
  timeout: OPENAI_TIMEOUT_MS,
})

/**
 * Call OpenAI with structured output using Zod schema
 */
export async function callOpenAIStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: any,
  schemaName: string,
  model: string = 'gpt-4o-2024-08-06'
): Promise<T> {
  return retryWithBackoff(async () => {
    const completion = await openai.beta.chat.completions.parse({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    })

    const parsed = completion.choices[0].message.parsed
    if (!parsed) {
      throw new Error('Failed to parse OpenAI response')
    }

    return parsed as T
  })
}

/**
 * Call OpenAI with standard completion
 */
export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gpt-4o'
): Promise<string> {
  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    return content
  })
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}
