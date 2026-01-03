import { PrivyClient } from '@privy-io/server-auth'
import { NextRequest } from 'next/server'

// Initialize Privy client (only if secrets are available)
let privyClient: PrivyClient | null = null
try {
  if (process.env.NEXT_PUBLIC_PRIVY_APP_ID && process.env.PRIVY_APP_SECRET) {
    privyClient = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      process.env.PRIVY_APP_SECRET
    )
  }
} catch (error) {
  console.error('[Privy] Failed to initialize client:', error)
}

/**
 * Get authenticated user from Privy access token
 * Extracts token from Authorization header and verifies it
 */
export async function getPrivyUser(request: NextRequest) {
  try {
    if (!privyClient) {
      console.log('[getPrivyUser] Privy client not initialized')
      return null
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.replace('Bearer ', '')
    const verifiedClaims = await privyClient.verifyAuthToken(token)

    // Get full user data
    const user = await privyClient.getUser(verifiedClaims.userId)

    return user
  } catch (error) {
    console.error('Privy auth verification failed:', error)
    return null
  }
}

/**
 * Get Privy user ID from request (lightweight version)
 * Only verifies token and returns user ID without fetching full user data
 */
export async function getPrivyUserId(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[getPrivyUserId] No Authorization header found')
      return null
    }

    const token = authHeader.replace('Bearer ', '')

    // If Privy client is not initialized, return null
    if (!privyClient) {
      console.log('[getPrivyUserId] Privy client not initialized - anonymous access')
      return null
    }

    // DEVELOPMENT MODE: If PRIVY_APP_SECRET is not set, decode JWT without verification
    // This allows testing without Privy dashboard access
    // WARNING: This is insecure and should only be used in development
    if (!process.env.PRIVY_APP_SECRET && process.env.NODE_ENV === 'development') {
      console.log('[getPrivyUserId] DEV MODE: Decoding JWT without verification')
      try {
        // Simple JWT decode (not verification!)
        const payload = token.split('.')[1]
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
        console.log('[getPrivyUserId] DEV MODE: User ID from token:', decoded.sub || decoded.userId)
        return decoded.sub || decoded.userId || null
      } catch (decodeError) {
        console.error('[getPrivyUserId] DEV MODE: Failed to decode token:', decodeError)
        return null
      }
    }

    // PRODUCTION MODE: Verify token properly
    const verifiedClaims = await privyClient.verifyAuthToken(token)
    return verifiedClaims.userId
  } catch (error) {
    console.error('Privy auth verification failed:', error)
    return null
  }
}
