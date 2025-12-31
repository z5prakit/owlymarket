'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { isValidMarketUrl } from '@/lib/utils/validation'

interface MarketInputProps {
  onSubmit: (url: string) => void
  isLoading?: boolean
}

export function MarketInput({ onSubmit, isLoading = false }: MarketInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a market URL')
      return
    }

    if (!isValidMarketUrl(url)) {
      setError('Please enter a valid Polymarket or Kalshi URL')
      return
    }

    setError('')
    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://polymarket.com/event/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} className="px-8">
          Analyze
        </Button>
      </div>
      <p className="mt-2 text-sm text-text-muted text-center">
        Paste a Polymarket or Kalshi market URL to analyze
      </p>
    </form>
  )
}
