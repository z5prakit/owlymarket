'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card } from '@/components/ui/Card'
import { PaymentModal } from './PaymentModal'

interface PaymentDetails {
  amount: string
  recipient: string
  currency: string
  network: string
  chainId: number
}

export function X402Banner() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const { address: evmAddress } = useAccount()
  const { publicKey: solanaPublicKey } = useWallet()
  const walletAddress = evmAddress || solanaPublicKey?.toString()

  const paymentDetails: PaymentDetails = {
    amount: process.env.NEXT_PUBLIC_X402_PAYMENT_AMOUNT || '10.00',
    recipient: process.env.NEXT_PUBLIC_PAYMENT_WALLET_BASE || '',
    currency: process.env.NEXT_PUBLIC_X402_CURRENCY || 'USDC',
    network: process.env.NEXT_PUBLIC_X402_NETWORK || 'base',
    chainId: Number(process.env.NEXT_PUBLIC_X402_CHAIN_ID) || 8453,
  }

  const handlePayment = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }
    setShowPaymentModal(true)
  }

  const handleSubmitTxHash = async (txHash: string) => {
    setIsVerifying(true)
    // Verify payment on backend
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, walletAddress }),
      })

      if (response.ok) {
        setShowPaymentModal(false)
        window.location.reload() // Refresh to update subscription status
      } else {
        alert('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      alert('Payment verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      {showPaymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setShowPaymentModal(false)}
          paymentDetails={paymentDetails}
          onSubmitTxHash={handleSubmitTxHash}
          isVerifying={isVerifying}
        />
      )}

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 rounded-full p-3">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">
                Pay with x402 Protocol
              </h3>
              <p className="text-sm text-text-muted">
                Secure on-chain payment • ${paymentDetails.amount} {paymentDetails.currency} on {paymentDetails.network.charAt(0).toUpperCase() + paymentDetails.network.slice(1)}
              </p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
          >
            Pay ${paymentDetails.amount} USDC
          </button>
        </div>
      </Card>
    </>
  )
}
