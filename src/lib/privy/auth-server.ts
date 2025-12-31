import { PrivyClient } from '@privy-io/server-auth'
import { NextRequest } from 'next/server'

// Initialize Privy client
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

/**
 * Get authenticated user from Privy access token
 * Extracts token from Authorization header and verifies it
 */
export async function getPrivyUser(request: NextRequest) {
  try {
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
      return null
    }

    const token = authHeader.replace('Bearer ', '')
    const verifiedClaims = await privyClient.verifyAuthToken(token)

    return verifiedClaims.userId
  } catch (error) {
    console.error('Privy auth verification failed:', error)
    return null
  }
}
