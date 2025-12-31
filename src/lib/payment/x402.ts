/**
 * x402 Payment Verification Utilities
 * Based on x402 protocol for Base network payments
 */

import { createPublicClient, http, parseUnits, type Address } from 'viem'
import { base } from 'viem/chains'

// Always use Base mainnet for now (chainId: 8453)
const CHAIN = base
const USDC_ADDRESS = process.env.NEXT_PUBLIC_BASE_USDC_CONTRACT as Address

const PAYMENT_AMOUNT = process.env.NEXT_PUBLIC_X402_PAYMENT_AMOUNT || '1.00'
const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET as Address

// Create public client for Base network
const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http()
})

// USDC ERC20 ABI (minimal for balance and transfer checking)
const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
] as const

export interface PaymentDetails {
  amount: string
  recipient: Address
  reference: string
  currency: string
  network: string
  chainId: number
}

export interface PaymentProof {
  txHash: string
  from: Address
  to: Address
  amount: string
  timestamp: number
  blockNumber: bigint
}

/**
 * Generate payment requirement details for x402 402 response
 */
export function generatePaymentRequirement(reference: string): PaymentDetails {
  return {
    amount: PAYMENT_AMOUNT,
    recipient: PAYMENT_WALLET,
    reference,
    currency: 'USDC',
    network: 'base',
    chainId: CHAIN.id,
  }
}

/**
 * Verify payment by checking transaction hash on-chain
 * Validates: amount >= $10, timestamp within 24h, tx not used before
 */
export async function verifyPayment(
  txHash: string,
  expectedReference: string,
  checkDuplicate: (txHash: string) => Promise<boolean> = async () => false
): Promise<PaymentProof | null> {
  try {
    console.log('[x402] Verifying payment:', txHash)

    // Check if tx hash already used
    const isDuplicate = await checkDuplicate(txHash)
    if (isDuplicate) {
      console.log('[x402] Transaction hash already used')
      return null
    }

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!receipt || receipt.status !== 'success') {
      console.log('[x402] Transaction not found or failed')
      return null
    }

    // Find Transfer event in logs
    const transferLog = receipt.logs.find((log) => {
      return (
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
      )
    })

    if (!transferLog) {
      console.log('[x402] No USDC transfer found in transaction')
      return null
    }

    // Decode transfer event
    const from = ('0x' + transferLog.topics[1]?.slice(26)) as Address
    const to = ('0x' + transferLog.topics[2]?.slice(26)) as Address
    const amount = BigInt(transferLog.data)

    // Verify recipient
    if (to.toLowerCase() !== PAYMENT_WALLET.toLowerCase()) {
      console.log('[x402] Wrong recipient:', to, 'expected:', PAYMENT_WALLET)
      return null
    }

    // Verify amount (USDC has 6 decimals) - must be >= $10
    const expectedAmount = parseUnits(PAYMENT_AMOUNT, 6)
    if (amount < expectedAmount) {
      console.log('[x402] Insufficient amount:', amount.toString(), 'expected:', expectedAmount.toString())
      return null
    }

    // Get block timestamp
    const block = await publicClient.getBlock({
      blockNumber: receipt.blockNumber,
    })

    const txTimestamp = Number(block.timestamp)
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const twentyFourHours = 24 * 60 * 60

    // Verify timestamp is within last 24 hours
    if (currentTimestamp - txTimestamp > twentyFourHours) {
      console.log('[x402] Transaction too old:', txTimestamp, 'current:', currentTimestamp)
      return null
    }

    console.log('[x402] Payment verified successfully')

    return {
      txHash,
      from,
      to,
      amount: (Number(amount) / 1e6).toString(), // Convert to USDC decimal
      timestamp: txTimestamp,
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    console.error('[x402] Error verifying payment:', error)
    return null
  }
}

/**
 * Parse x402 payment header from request
 * Format: "txHash:<hash>" or just "<hash>"
 */
export function parsePaymentHeader(headerValue: string): string | null {
  if (!headerValue) return null

  // Remove "txHash:" prefix if present
  const txHash = headerValue.replace(/^txHash:/, '').trim()

  // Validate hex format
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return null
  }

  return txHash
}
