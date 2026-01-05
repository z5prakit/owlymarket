/**
 * Simple wallet-based authentication
 * User ID = wallet address (EVM or Solana)
 */

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation (base58, 32-44 chars)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

export function isValidWalletAddress(address: string): boolean {
  return isValidEthereumAddress(address) || isValidSolanaAddress(address)
}

export function normalizeWalletAddress(address: string): string {
  // EVM addresses to lowercase for consistency
  if (isValidEthereumAddress(address)) {
    return address.toLowerCase()
  }
  // Solana addresses are case-sensitive, keep as is
  return address
}

export function getChainFromAddress(address: string): 'base' | 'solana' | null {
  if (isValidEthereumAddress(address)) return 'base'
  if (isValidSolanaAddress(address)) return 'solana'
  return null
}
