'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { MarketInput } from '@/components/analysis/MarketInput'
import { Card } from '@/components/ui/Card'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { useAccount, useSignMessage } from 'wagmi'
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
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [pendingMarketUrl, setPendingMarketUrl] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubscriptionPayment, setIsSubscriptionPayment] = useState(false)

  const handleSubmit = async (marketUrl: string) => {
    setIsLoading(true)
    setError('')
    setPendingMarketUrl(marketUrl)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add wallet signature if connected
      if (isConnected && address) {
        try {
          const message = `Analyze market on OwlyMarket\nWallet: ${address}\nTimestamp: ${Date.now()}`
          const signature = await signMessageAsync({
            message,
            account: address
          })
          headers['X-Wallet-Address'] = address
          headers['X-Wallet-Signature'] = signature
          headers['X-Signature-Message'] = message
        } catch (e) {
          console.log('[HomePage] Failed to sign message, proceeding without auth:', e)
        }
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ market_url: marketUrl }),
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

      // Add wallet signature if connected
      if (isConnected && address) {
        try {
          const message = `Payment verification on OwlyMarket\nWallet: ${address}\nTx: ${txHash}\nTimestamp: ${Date.now()}`
          const signature = await signMessageAsync({
            message,
            account: address
          })
          headers['X-Wallet-Address'] = address
          headers['X-Wallet-Signature'] = signature
          headers['X-Signature-Message'] = message
        } catch (e) {
          console.log('[HomePage] Failed to sign message:', e)
        }
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ market_url: pendingMarketUrl }),
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
            <span className="text-2xl">💎</span>
            <span className="text-primary font-medium">
              Connect wallet → 2 free analyses daily
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            AI Research for
            <br />
            <span className="text-primary">Prediction Markets</span>
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
        </div>
      </Container>
    </>
  )
}
