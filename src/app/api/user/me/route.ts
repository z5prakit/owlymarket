/**
 * GET /api/user/me - Get current user info and usage stats
 * Uses wallet address as user ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserDailyAnalysesCount } from '@/lib/supabase/queries'
import { handleAPIError } from '@/lib/utils/errors'
import { FREE_TIER_LIMIT } from '@/config/constants'
import { isValidWalletAddress, normalizeWalletAddress } from '@/lib/auth/wallet'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query parameter
    const walletAddress = request.nextUrl.searchParams.get('address')

    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const userId = normalizeWalletAddress(walletAddress)

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
