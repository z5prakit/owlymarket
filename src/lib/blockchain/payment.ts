/**
 * Payment utilities for BSC USDT transfers
 */

import {
  parseUnits,
  formatUnits,
  type Address,
  type Hash,
  type WalletClient,
} from 'viem'
import { writeContract, readContract } from 'viem/actions'
import { publicClient, USDT_ADDRESS, USDTConfig, PAYMENT_WALLET } from './config'
import type { TransactionRequest } from '@/types/blockchain'

// USDT Contract ABI (minimal - just transfer function)
export const USDT_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const

/**
 * Transfer USDT to payment wallet
 */
export async function transferUSDT(
  walletClient: WalletClient,
  amount: string // Human-readable amount (e.g., "10.5")
): Promise<Hash> {
  const account = walletClient.account
  if (!account) {
    throw new Error('Wallet not connected')
  }

  // Parse amount to wei (18 decimals for BSC USDT)
  const amountWei = parseUnits(amount, USDTConfig.decimals)

  // Execute transfer
  const hash = await writeContract(walletClient, {
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'transfer',
    args: [PAYMENT_WALLET, amountWei],
    account,
  })

  return hash
}

/**
 * Get USDT balance of address
 */
export async function getUSDTBalance(address: Address): Promise<string> {
  const balance = (await readContract(publicClient, {
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [address],
  })) as bigint

  return formatUnits(balance, USDTConfig.decimals)
}

/**
 * Check if user has sufficient USDT balance
 */
export async function hasSufficientBalance(
  address: Address,
  requiredAmount: string
): Promise<boolean> {
  const balance = await getUSDTBalance(address)
  return parseFloat(balance) >= parseFloat(requiredAmount)
}
