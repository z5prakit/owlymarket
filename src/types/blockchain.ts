// Blockchain Types for BSC Integration

import type { Address, Hash } from 'viem'

// Chain configuration
export type ChainType = 'bsc' | 'bsc-testnet'

export interface ChainConfig {
  id: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// USDT Contract
export interface USDTConfig {
  address: Address
  decimals: number
  symbol: string
}

// Wallet connection
export interface WalletState {
  address: Address | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
}

// Transaction
export interface TransactionRequest {
  to: Address
  amount: string // Human-readable amount (e.g., "10.5")
}

export interface TransactionReceipt {
  hash: Hash
  status: 'success' | 'reverted'
  blockNumber: bigint
  from: Address
  to: Address
  gasUsed: bigint
}

// Payment verification
export interface PaymentVerification {
  isValid: boolean
  txHash: Hash
  from: Address
  to: Address
  amount: bigint
  amountFormatted: string
  timestamp: number
}

// Transfer event (from USDT contract)
export interface TransferEvent {
  from: Address
  to: Address
  value: bigint
}

// Error types
export type WalletError =
  | 'USER_REJECTED'
  | 'NETWORK_MISMATCH'
  | 'INSUFFICIENT_BALANCE'
  | 'TRANSACTION_FAILED'
  | 'UNKNOWN_ERROR'

export interface BlockchainError {
  type: WalletError
  message: string
  originalError?: Error
}
