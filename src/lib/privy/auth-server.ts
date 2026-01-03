import { NextRequest } from 'next/server'
import { verifyMessage } from 'viem'

// Wallet authentication using signature verification

/**
 * Get wallet address from request by verifying signature
 * Returns wallet address if signature is valid, null otherwise
 */
export async function getWalletAddress(request: NextRequest): Promise<string | null> {
  try {
    const address = request.headers.get('X-Wallet-Address')
    const signature = request.headers.get('X-Wallet-Signature')
    const message = request.headers.get('X-Signature-Message')

    if (!address || !signature || !message) {
      console.log('[getWalletAddress] Missing wallet authentication headers')
      return null
    }

    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      console.error('[getWalletAddress] Invalid signature')
      return null
    }

    console.log('[getWalletAddress] Verified wallet:', address)
    return address
  } catch (error) {
    console.error('[getWalletAddress] Signature verification failed:', error)
    return null
  }
}

/**
 * Alias for backward compatibility
 */
export async function getPrivyUserId(request: NextRequest): Promise<string | null> {
  return getWalletAddress(request)
}
