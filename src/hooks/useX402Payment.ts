/**
 * x402 Automated Payment Hook
 * Uses Privy wallet to send USDC automatically
 */

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { parseUnits, type Address } from 'viem'
import { base } from 'viem/chains'

// Always use Base mainnet for now (chainId: 8453)
const CHAIN = base

// USDC Contract address on Base mainnet
const USDC_ADDRESS = process.env.NEXT_PUBLIC_BASE_USDC_CONTRACT as Address

// USDC transfer ABI (ERC20)
const USDC_ABI = [
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
] as const

export function useX402Payment() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [isPayingwallet, setIsPayingwallet] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payWithWallet = async (
    recipient: Address,
    amount: string
  ): Promise<string | null> => {
    if (!ready || !authenticated) {
      setError('Please sign in first')
      return null
    }

    if (wallets.length === 0) {
      setError('No wallet connected')
      return null
    }

    setIsPayingwallet(true)
    setError(null)

    try {
      const wallet = wallets[0] // Use first wallet
      await wallet.switchChain(CHAIN.id)

      // Get wallet client from Privy
      const provider = await wallet.getEthereumProvider()

      // Parse amount (USDC has 6 decimals)
      const amountInUnits = parseUnits(amount, 6)

      console.log('[x402] Sending payment:', {
        from: wallet.address,
        to: recipient,
        amount: amount + ' USDC',
        amountInUnits: amountInUnits.toString(),
      })

      // Send USDC transfer transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: wallet.address,
            to: USDC_ADDRESS,
            data: encodeTransferData(recipient, amountInUnits),
            chainId: `0x${CHAIN.id.toString(16)}`,
          },
        ],
      })

      console.log('[x402] ✓ Payment sent:', txHash)
      setIsPayingwallet(false)
      return txHash as string
    } catch (err) {
      console.error('[x402] Payment failed:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsPayingwallet(false)
      return null
    }
  }

  return {
    payWithWallet,
    isPayingwallet,
    error,
  }
}

// Helper: Encode ERC20 transfer function data
function encodeTransferData(to: Address, amount: bigint): string {
  // Function signature: transfer(address,uint256)
  const functionSignature = '0xa9059cbb' // keccak256("transfer(address,uint256)").slice(0, 10)

  // Encode address (32 bytes, left-padded)
  const addressParam = to.slice(2).padStart(64, '0')

  // Encode amount (32 bytes, left-padded)
  const amountParam = amount.toString(16).padStart(64, '0')

  return functionSignature + addressParam + amountParam
}
