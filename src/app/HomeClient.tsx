'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { Container } from '@/components/layout/Container'
import { MarketInput } from '@/components/analysis/MarketInput'
import { Card } from '@/components/ui/Card'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { X402Banner } from '@/components/payment/X402Banner'
import type { CreateAnalysisResponse } from '@/types/api'

interface PaymentDetails {
  amount: string
  recipient: string
  currency: string
  network: string
  chainId: number
}

export default function HomeClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [pendingMarketUrl, setPendingMarketUrl] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Get wallet addresses
  const { address: evmAddress } = useAccount()
  const { publicKey: solanaPublicKey } = useWallet()

  // Use first available wallet address (Base or Solana)
  const walletAddress = evmAddress || solanaPublicKey?.toString()

  const handleSubmit = async (marketUrl: string) => {
    setIsLoading(true)
    setError('')
    setPendingMarketUrl(marketUrl)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          market_url: marketUrl,
          wallet_address: walletAddress || undefined, // Send wallet address if connected
        }),
      })

      console.log('[HomePage] Response status:', response.status)

      // Handle authentication error
      if (response.status === 401) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Please connect your wallet to analyze markets')
      }

      if (response.status === 429) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Rate limit exceeded. Please try again later.')
      }

      if (response.status === 402) {
        const details = await response.json()
        setPaymentDetails(details)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        let errorMessage = 'Failed to create analysis'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          console.error('[HomePage] Failed to parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const data: CreateAnalysisResponse = await response.json()
      console.log('Analysis created:', data)
      router.push(`/analyze/${data.id}`)
    } catch (error) {
      console.error('Error creating analysis:', error)
      setError(error instanceof Error ? error.message : 'Failed to create analysis')
      setIsLoading(false)
    }
  }

  const handleSubmitTxHash = async (txHash: string) => {
    setIsVerifying(true)
    setError('')

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Payment': txHash,
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          market_url: pendingMarketUrl,
          wallet_address: walletAddress || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment verification failed')
      }

      const data: CreateAnalysisResponse = await response.json()
      setPaymentDetails(null)
      router.push(`/analyze/${data.id}`)
    } catch (error) {
      console.error('Error verifying payment:', error)
      setError(error instanceof Error ? error.message : 'Payment verification failed')
      setIsVerifying(false)
    }
  }

  return (
    <>
      {paymentDetails && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentDetails(null)}
          paymentDetails={paymentDetails}
          onSubmitTxHash={handleSubmitTxHash}
          isVerifying={isVerifying}
        />
      )}

      <Container className="py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-8">
            <span className="text-2xl">💎</span>
            <span className="text-primary font-medium">
              Connect wallet → 2 free analyses daily
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            AI Research for
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Prediction Markets
            </span>
          </h1>

          <p className="text-xl text-text-muted mb-12">
            Deep analysis powered by AI agents and Bayesian probability.
          </p>

          <Card className="p-8 mb-12">
            <MarketInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </Card>

          {/* X402 Payment Banner */}
          <div className="mb-16">
            <X402Banner />
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="mt-24">
            <h2 className="text-4xl font-bold text-text mb-4">Simple Pricing</h2>
            <p className="text-lg text-text-muted mb-12">
              Choose the plan that works for you
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <Card className="p-8 border-2 border-border">
                <h3 className="text-2xl font-bold text-text mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-primary">$0</span>
                  <span className="text-text-muted">/day</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-text-muted">2 analyses per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-text-muted">Full AI research reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-text-muted">Bayesian probability analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-text-muted">Polymarket & Kalshi support</span>
                  </li>
                </ul>
                <div className="text-center text-sm text-text-muted">
                  Connect wallet to get started
                </div>
              </Card>

              {/* Pro Tier */}
              <Card className="p-8 border-2 border-primary relative bg-background-card">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-background px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">$10</span>
                  <span className="text-text-muted">USDC</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">✓</span>
                    <span className="text-text-muted">Unlimited analyses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">✓</span>
                    <span className="text-text-muted">Priority processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">✓</span>
                    <span className="text-text-muted">Advanced insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">✓</span>
                    <span className="text-text-muted">Export to PDF</span>
                  </li>
                </ul>
                <button
                  onClick={() => {
                    if (!walletAddress) {
                      setError('Please connect your wallet first')
                      return
                    }
                    setPaymentDetails({
                      amount: '10.00',
                      recipient: process.env.NEXT_PUBLIC_PAYMENT_WALLET_BASE || '',
                      currency: 'USDC',
                      network: 'Base',
                      chainId: 8453,
                    })
                  }}
                  className="w-full bg-cta hover:bg-cta-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Subscribe with USDC
                </button>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
