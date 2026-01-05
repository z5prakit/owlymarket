/**
 * GET /api/analyses - Get all analyses
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverGetAllAnalyses } from '@/lib/supabase/queries'
import { handleAPIError } from '@/lib/utils/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { analyses, total } = await serverGetAllAnalyses(limit, offset)

    return NextResponse.json({
      analyses: analyses.map((analysis) => ({
        id: analysis.id,
        market_url: analysis.market_url,
        market_source: analysis.market_source,
        market_title: analysis.market_title,
        status: analysis.status,
        // Extract AI prediction from report_json
        ai_prediction: analysis.report_json?.final_prediction?.probability >= 0.5 ? 'YES' : 'NO',
        probability: analysis.report_json?.final_prediction?.probability
          ? Math.round(analysis.report_json.final_prediction.probability * 100)
          : null,
        confidence: analysis.report_json?.final_prediction?.confidence || null,
        created_at: analysis.created_at,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
