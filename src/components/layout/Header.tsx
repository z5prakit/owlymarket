'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { SubscribeModal } from '@/components/subscription/SubscribeModal'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

interface UserStats {
  dailyUsage: {
    used: number
    limit: number
    remaining: number
  }
}

export function Header() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  // Fetch user stats when connected
  useEffect(() => {
    if (isConnected && address) {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(err => console.error('Error fetching user stats:', err))
    } else {
      setUserStats(null)
    }
  }, [isConnected, address])

  const handleSignIn = () => {
    open()
  }

  const handleSignOut = () => {
    disconnect()
  }

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId)
    setShowSubscribeModal(false)
  }

  return (
    <>
      {showSubscribeModal && (
        <SubscribeModal
          onClose={() => setShowSubscribeModal(false)}
          onSelectPlan={handleSelectPlan}
        />
      )}

      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            {siteConfig.name}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-text hover:text-primary">
              Features
            </Link>
            <Link href="/#pricing" className="text-text hover:text-primary">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-text hover:text-primary">
              Dashboard
            </Link>

            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="text-text-muted">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  {userStats?.dailyUsage && (
                    <div className={`text-xs ${userStats.dailyUsage.remaining > 0 ? 'text-primary' : 'text-error'}`}>
                      {userStats.dailyUsage.remaining}/{userStats.dailyUsage.limit} analyses left today
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSignIn}
              >
                Connect Wallet
              </Button>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
