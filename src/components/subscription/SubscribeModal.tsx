'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'pay-per-use',
    name: 'Pay Per Analysis',
    price: 10,
    period: 'per analysis',
    features: [
      'Full multi-agent AI research',
      'Evidence grading (A-F scale)',
      'Bayesian probability analysis',
      'Comprehensive markdown report',
      'On-chain payment verification',
      'Results in ~60 seconds',
    ],
  },
]

interface SubscribeModalProps {
  onClose: () => void
  onSelectPlan: (planId: string) => void
}

export function SubscribeModal({ onClose, onSelectPlan }: SubscribeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pay-per-use')

  const handleSubscribe = () => {
    onSelectPlan(selectedPlan)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-text">Get Your Analysis</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="border-2 border-primary rounded-lg p-6 bg-blue-50"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-bold text-primary mb-1">
                  ${plan.price}
                </div>
                <div className="text-sm text-text-muted">{plan.period}</div>
              </div>

              <ul className="space-y-3 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold mb-2 text-sm">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
            <li>Paste your Polymarket URL</li>
            <li>Send $10 USDC on Base network</li>
            <li>Submit transaction hash</li>
            <li>Get your AI analysis</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubscribe} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
