/**
 * POST /api/user/sync - Create or update user record on wallet connect
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrivyUserId } from '@/lib/privy/auth-server'
import { handleAPIError } from '@/lib/utils/errors'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const userId = await getPrivyUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serverClient = createServerClient()

    // Check if user exists
    const { data: existingUser } = await serverClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUser) {
      // User exists, return their data
      console.log('[UserSync] User already exists:', userId)
      return NextResponse.json({
        user: existingUser,
        created: false,
      })
    }

    // Create new user
    const { data: newUser, error } = await serverClient
      .from('users')
      .insert({
        id: userId,
        wallet_address: null, // Will be updated if needed
        subscription_tier: 'free',
        analyses_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('[UserSync] Error creating user:', error)
      throw error
    }

    console.log('[UserSync] Created new user:', userId)

    return NextResponse.json({
      user: newUser,
      created: true,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
