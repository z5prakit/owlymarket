/**
 * Blockchain configuration for BSC
 */

import { bsc, bscTestnet } from 'viem/chains'
import { createPublicClient, http } from 'viem'
import type { Address } from 'viem'
import type { ChainConfig, USDTConfig } from '@/types/blockchain'

const isProduction = process.env.NODE_ENV === 'production'

// Chain selection
export const currentChain = isProduction ? bsc : bscTestnet

// RPC URLs
const BSC_RPC_URL =
  process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
const BSC_TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
  'https://data-seed-prebsc-1-s1.binance.org:8545/'

export const rpcUrl = isProduction ? BSC_RPC_URL : BSC_TESTNET_RPC_URL

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(rpcUrl),
})

// USDT Contract addresses
const USDT_MAINNET: Address =
  (process.env.NEXT_PUBLIC_USDT_CONTRACT as Address) ||
  '0x55d398326f99059ff775485246999027b3197955'

const USDT_TESTNET: Address =
  (process.env.NEXT_PUBLIC_USDT_CONTRACT_TESTNET as Address) ||
  '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'

export const USDT_ADDRESS: Address = isProduction ? USDT_MAINNET : USDT_TESTNET

// USDT Configuration
export const USDTConfig: USDTConfig = {
  address: USDT_ADDRESS,
  decimals: 18, // USDT on BSC has 18 decimals (unlike 6 on Ethereum)
  symbol: 'USDT',
}

// Payment wallet (where users send USDT)
export const PAYMENT_WALLET: Address =
  (process.env.NEXT_PUBLIC_PAYMENT_WALLET as Address) ||
  '0x0000000000000000000000000000000000000000' // Replace with actual wallet

// Chain configs
export const BSCConfig: ChainConfig = {
  id: bsc.id,
  name: 'BNB Smart Chain',
  rpcUrl: BSC_RPC_URL,
  blockExplorer: 'https://bscscan.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
}

export const BSCTestnetConfig: ChainConfig = {
  id: bscTestnet.id,
  name: 'BNB Smart Chain Testnet',
  rpcUrl: BSC_TESTNET_RPC_URL,
  blockExplorer: 'https://testnet.bscscan.com',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
}

export const chainConfig = isProduction ? BSCConfig : BSCTestnetConfig
