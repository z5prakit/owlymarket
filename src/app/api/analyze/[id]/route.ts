/**
 * GET /api/analyze/[id] - Get analysis by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverGetAnalysis } from '@/lib/supabase/queries'
import { handleAPIError, NotFoundError } from '@/lib/utils/errors'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const analysis = await serverGetAnalysis(id)

    if (!analysis) {
      throw new NotFoundError('Analysis not found')
    }

    // TODO: Check if user has access (owner or public)
    // For now, allow all

    return NextResponse.json({
      id: analysis.id,
      market_url: analysis.market_url,
      market_source: analysis.market_source,
      market_title: analysis.market_title,
      status: analysis.status,
      progress_step: analysis.progress_step || null,
      progress_message: analysis.progress_message || null,
      report: analysis.report_json,
      error_message: analysis.error_message,
      created_at: analysis.created_at,
      updated_at: analysis.updated_at,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
