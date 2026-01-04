/**
 * OpenAI API integration
 */

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { retryWithBackoff } from '@/lib/utils/api'
import { OPENAI_TIMEOUT_MS } from '@/config/constants'

const apiKey = process.env.OPENAI_API_KEY

console.log('[OpenAI] Initializing OpenAI client...')
console.log('[OpenAI] API key present:', !!apiKey)
console.log('[OpenAI] API key length:', apiKey?.length || 0)
console.log('[OpenAI] API key prefix:', apiKey?.substring(0, 15) + '...' || 'N/A')

if (!apiKey) {
  console.error('[OpenAI] ERROR: Missing OPENAI_API_KEY environment variable')
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

console.log('[OpenAI] Creating OpenAI client with timeout:', OPENAI_TIMEOUT_MS, 'ms')

export const openai = new OpenAI({
  apiKey,
  timeout: OPENAI_TIMEOUT_MS,
})

console.log('[OpenAI] OpenAI client created successfully')

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
  console.log('[OpenAI] callOpenAIStructured called with model:', model, 'schema:', schemaName)

  return retryWithBackoff(async () => {
    try {
      console.log('[OpenAI] Making API call to OpenAI...')
      const completion = await openai.beta.chat.completions.parse({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: zodResponseFormat(schema, schemaName),
      })

      console.log('[OpenAI] API call successful')
      const parsed = completion.choices[0].message.parsed
      if (!parsed) {
        console.error('[OpenAI] Failed to parse response')
        throw new Error('Failed to parse OpenAI response')
      }

      return parsed as T
    } catch (error) {
      console.error('[OpenAI] API call failed:', error)
      console.error('[OpenAI] Error type:', error instanceof Error ? error.name : typeof error)
      console.error('[OpenAI] Error message:', error instanceof Error ? error.message : String(error))
      throw error
    }
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
