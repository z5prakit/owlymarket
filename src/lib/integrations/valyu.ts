/**
 * Valyu AI integration (optional - for proprietary data access)
 */

import { ENABLE_VALYU } from '@/config/constants'

const VALYU_API_KEY = process.env.VALYU_API_KEY

export interface ValyuSearchResult {
  title: string
  url: string
  snippet: string
  source: string
  relevance_score: number
}

/**
 * Search using Valyu API
 */
export async function searchWithValyu(
  query: string,
  options: {
    includedSources?: string[]
    excludedSources?: string[]
    maxResults?: number
  } = {}
): Promise<ValyuSearchResult[]> {
  // Check if Valyu is enabled and API key is available
  if (!ENABLE_VALYU || !VALYU_API_KEY) {
    console.warn('Valyu is not enabled or API key is missing')
    return []
  }

  try {
    const response = await fetch('https://api.valyu.ai/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VALYU_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        included_sources: options.includedSources || [
          'pubmed',
          'arxiv',
          'financial_data',
          'web',
        ],
        excluded_sources: options.excludedSources || [],
        max_results: options.maxResults || 10,
        rerank: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Valyu API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error calling Valyu API:', error)
    return []
  }
}

/**
 * Fallback web search (when Valyu is not available)
 */
export async function fallbackWebSearch(
  query: string
): Promise<ValyuSearchResult[]> {
  // In production, you might want to use another search API
  // For now, return empty array
  console.log('Using fallback web search for:', query)
  return []
}
