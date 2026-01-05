/**
 * x402 Automated Payment Hook
 * Uses wagmi to send USDC on Base network
 */

import { useState } from 'react'
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi'
import { parseUnits, type Address } from 'viem'
import { base } from 'wagmi/chains'

// USDC Contract address on Base mainnet
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_BASE_USDC_CONTRACT || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as Address

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
  const { address, isConnected, chain } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { switchChainAsync } = useSwitchChain()
  const [isPayingwallet, setIsPayingwallet] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payWithWallet = async (
    recipient: Address,
    amount: string
  ): Promise<string | null> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return null
    }

    setIsPayingwallet(true)
    setError(null)

    try {
      // Switch to Base if needed
      if (chain?.id !== base.id) {
        await switchChainAsync({ chainId: base.id })
      }

      // Parse amount (USDC has 6 decimals)
      const amountInUnits = parseUnits(amount, 6)

      console.log('[x402] Sending payment:', {
        from: address,
        to: recipient,
        amount: amount + ' USDC',
        amountInUnits: amountInUnits.toString(),
      })

      // Send USDC transfer transaction
      const txHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [recipient, amountInUnits],
        chainId: base.id,
      })

      console.log('[x402] ✓ Payment sent:', txHash)
      setIsPayingwallet(false)
      return txHash
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
