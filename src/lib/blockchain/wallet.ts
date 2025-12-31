/**
 * Wallet connection utilities (for use with Wagmi)
 */

import type { Address } from 'viem'
import type { WalletState, BlockchainError, WalletError } from '@/types/blockchain'

/**
 * Create blockchain error
 */
export function createBlockchainError(
  type: WalletError,
  message: string,
  originalError?: Error
): BlockchainError {
  return {
    type,
    message,
    originalError,
  }
}

/**
 * Handle wallet error
 */
export function handleWalletError(error: unknown): BlockchainError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('user rejected') || message.includes('user denied')) {
      return createBlockchainError(
        'USER_REJECTED',
        'Transaction was rejected by user',
        error
      )
    }

    if (message.includes('insufficient')) {
      return createBlockchainError(
        'INSUFFICIENT_BALANCE',
        'Insufficient balance for transaction',
        error
      )
    }

    if (message.includes('wrong network') || message.includes('chain')) {
      return createBlockchainError(
        'NETWORK_MISMATCH',
        'Please switch to Binance Smart Chain',
        error
      )
    }

    if (message.includes('transaction failed') || message.includes('reverted')) {
      return createBlockchainError(
        'TRANSACTION_FAILED',
        'Transaction failed on blockchain',
        error
      )
    }
  }

  return createBlockchainError(
    'UNKNOWN_ERROR',
    'An unknown error occurred',
    error instanceof Error ? error : undefined
  )
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
