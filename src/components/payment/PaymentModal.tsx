'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useX402Payment } from '@/hooks/useX402Payment'
import type { Address } from 'viem'

interface PaymentDetails {
  amount: string
  recipient: string
  currency: string
  network: string
  chainId: number
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentDetails: PaymentDetails
  onSubmitTxHash: (txHash: string) => void
  isVerifying: boolean
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentDetails,
  onSubmitTxHash,
  isVerifying,
}: PaymentModalProps) {
  const [txHash, setTxHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const { payWithWallet, isPayingwallet, error: paymentError } = useX402Payment()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentDetails.recipient)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = () => {
    if (txHash.trim()) {
      onSubmitTxHash(txHash.trim())
    }
  }

  const handlePayWithWallet = async () => {
    // Trim recipient address to avoid viem errors
    const cleanRecipient = paymentDetails.recipient.trim() as Address
    const hash = await payWithWallet(cleanRecipient, paymentDetails.amount)

    if (hash) {
      // Auto-submit tx hash
      console.log('[PaymentModal] Payment successful, submitting tx hash:', hash)
      onSubmitTxHash(hash)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">Payment Required</h2>
          <p className="text-text-muted text-sm">
            Please send {paymentDetails.amount} {paymentDetails.currency} to the address below
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase">Network</label>
            <p className="text-sm font-mono font-semibold text-text capitalize">
              {paymentDetails.network} (Chain ID: {paymentDetails.chainId})
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase">Amount</label>
            <p className="text-2xl font-bold text-primary">
              ${paymentDetails.amount} {paymentDetails.currency}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase mb-2 block">
              Recipient Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={paymentDetails.recipient}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-border rounded text-xs font-mono"
              />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* x402 Automated Payment (Primary Option) */}
        {!showManualInput ? (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-semibold text-sm text-blue-900">x402 Instant Payment</h3>
              </div>
              <p className="text-xs text-blue-800 mb-3">
                Click below to pay with your connected wallet. The system will automatically verify and unlock your analysis.
              </p>
              <p className="text-xs text-blue-700 font-semibold">
                ✓ Automated • ✓ Instant • ✓ Secure
              </p>
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {paymentError}
              </div>
            )}

            {/* Primary Action: Pay with Wallet */}
            <Button
              variant="primary"
              onClick={handlePayWithWallet}
              className="w-full py-4 text-lg font-bold"
              disabled={isPayingwallet || isVerifying}
            >
              {isPayingwallet ? '⏳ Sending Payment...' : isVerifying ? 'Verifying...' : `💳 Pay ${paymentDetails.amount} USDC with Wallet`}
            </Button>

            <button
              onClick={() => setShowManualInput(true)}
              className="text-xs text-text-muted hover:text-primary underline w-full text-center"
            >
              or enter transaction hash manually
            </button>
          </>
        ) : (
          <>
            {/* Manual Input (Fallback) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">Manual Payment Instructions:</h3>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the recipient address above</li>
                <li>Send exactly ${paymentDetails.amount} USDC on Base network</li>
                <li>Wait for transaction to confirm (usually {'<'}1 minute)</li>
                <li>Paste the transaction hash below</li>
              </ol>
            </div>

            {/* TX Hash Input */}
            <div>
              <label htmlFor="txHash" className="block text-sm font-medium text-text mb-2">
                Transaction Hash
              </label>
              <input
                id="txHash"
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isVerifying}
              />
              <p className="text-xs text-text-muted mt-1">
                Find this in your wallet after sending the payment
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowManualInput(false)}
                className="flex-1"
                disabled={isVerifying}
              >
                ← Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
                disabled={!txHash.trim() || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Payment'}
              </Button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="text-sm text-text-muted hover:text-text underline w-full text-center"
          disabled={isVerifying || isPayingwallet}
        >
          Cancel
        </button>

        {/* Warning */}
        <div className="text-xs text-text-muted text-center">
          ⚠️ Transaction must be within 24 hours and not previously used
        </div>
      </div>
    </div>
  )
}
