/**
 * GET /api/user/me - Get current user info and usage stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrivyUserId } from '@/lib/privy/auth-server'
import { getUserDailyAnalysesCount } from '@/lib/supabase/queries'
import { handleAPIError } from '@/lib/utils/errors'
import { FREE_TIER_LIMIT } from '@/config/constants'

export async function GET(request: NextRequest) {
  try {
    const userId = await getPrivyUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get daily usage count
    const dailyCount = await getUserDailyAnalysesCount(userId)
    const remaining = Math.max(0, FREE_TIER_LIMIT - dailyCount)

    return NextResponse.json({
      userId,
      dailyUsage: {
        used: dailyCount,
        limit: FREE_TIER_LIMIT,
        remaining,
      },
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
