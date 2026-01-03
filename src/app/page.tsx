'use client'

export const dynamic = 'force-dynamic'

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

export default function HomePage() {
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
        // Rate limit exceeded
        const errorData = await response.json()
        throw new Error(errorData.message || 'Rate limit exceeded. Please try again later.')
      }

      if (response.status === 402) {
        // Payment required (exceeded free tier)
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

      const data = await response.json()
      console.log('Analysis created:', data)
      // Redirect to analysis page
      router.push(`/analyze/${data.id}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create analysis')
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
        throw new Error(errorData.error || 'Payment verification failed')
      }

      const data = await response.json()
      // Redirect to analysis page
      router.push(`/analyze/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment verification failed')
      setIsVerifying(false)
    }
  }

  const handleCancelPayment = () => {
    setPaymentDetails(null)
    setPendingMarketUrl('')
    setIsLoading(false)
  }

  const handleSubscribeClick = () => {
    // Show x402 payment modal for subscription ($10/month)
    setIsSubscriptionPayment(true)
    setPaymentDetails({
      amount: '10.00',
      recipient: process.env.NEXT_PUBLIC_PAYMENT_WALLET || '0x4C1B685E469541586f4cD55eFA4C77Ad2EC6C28D',
      currency: 'USDC',
      network: 'base',
      chainId: 8453,
    })
  }

  const handleSubscriptionPayment = async (txHash: string) => {
    setIsVerifying(true)
    setError('')

    try {
      // In real app, verify subscription payment on backend
      console.log('[Subscription] Payment tx:', txHash)

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000))

      alert('✅ Subscription activated! You now have unlimited analyses.')
      setPaymentDetails(null)
      setIsSubscriptionPayment(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription payment failed')
      setIsVerifying(false)
    }
  }

  return (
    <Container>
      {/* Payment Modal */}
      {paymentDetails && (
        <PaymentModal
          paymentDetails={paymentDetails}
          onSubmitTxHash={isSubscriptionPayment ? handleSubscriptionPayment : handleSubmitTxHash}
          onCancel={handleCancelPayment}
          isVerifying={isVerifying}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)] -z-10" />

        <div className="text-center py-24 px-4">
          <div className="inline-block mb-6">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-full backdrop-blur-sm">
              <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎁 Connect wallet → 2 free analyses daily
              </p>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            AI Research for<br />Prediction Markets
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Deep analysis powered by AI agents and Bayesian probability.
          </p>

          <div className="max-w-2xl mx-auto">
            <MarketInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 max-w-2xl mx-auto text-sm shadow-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">How it works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powered by 8 specialized AI agents working together
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">AI Agents</h3>
              <p className="text-slate-600 leading-relaxed">
                8 specialized agents research and analyze market outcomes
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Probability</h3>
              <p className="text-slate-600 leading-relaxed">
                Bayesian analysis with evidence weighting
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Grading</h3>
              <p className="text-slate-600 leading-relaxed">
                Evidence scored A-F on credibility and recency
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* x402 Payment Section */}
      <div className="relative py-24 px-4 overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Powered by x402
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Pay-per-use with x402</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Instant USDC payments on Base.<br />
              <strong className="text-slate-900">No subscriptions. No credit cards.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 cursor-pointer hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Instant</h3>
              <p className="text-slate-600 leading-relaxed">
                One-click payment with your wallet
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 cursor-pointer hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">On-Chain</h3>
              <p className="text-slate-600 leading-relaxed">
                Verified on Base blockchain
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 cursor-pointer hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Pay-Per-Use</h3>
              <p className="text-slate-600 leading-relaxed">
                Only pay when you need analysis
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/50">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">1</div>
                <p className="font-semibold text-slate-900">Connect</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-purple-500/30">2</div>
                <p className="font-semibold text-slate-900">Paste URL</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-orange-500/30">3</div>
                <p className="font-semibold text-slate-900">Pay $10</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/30">4</div>
                <p className="font-semibold text-slate-900">Get Analysis</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleSubscribeClick}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Subscribe - $10/month
            </button>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Pricing</h2>
          <p className="text-lg text-slate-600">Choose the plan that works for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              Popular
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Free</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">$0</span>
              </div>
              <p className="text-slate-600 font-medium">2 analyses daily</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Full AI analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Evidence grading</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Probability analysis</span>
              </li>
            </ul>
          </div>

          {/* Paid Tier */}
          <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-500 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-bl-2xl text-xs font-bold shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                x402
              </div>
            </div>
            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Pay Per Use</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">$10</span>
              </div>
              <p className="text-slate-600 font-medium mb-1">per analysis</p>
              <p className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">USDC on Base</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Full AI analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Evidence grading</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Probability analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Instant payment</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Results in ~60 sec</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  )
}
