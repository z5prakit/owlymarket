'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { SubscribeModal } from '@/components/subscription/SubscribeModal'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'

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
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()

  // Fetch user stats when authenticated
  useEffect(() => {
    if (authenticated) {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(err => console.error('Error fetching user stats:', err))
    } else {
      setUserStats(null)
    }
  }, [authenticated])

  const handleSignIn = () => {
    login()
  }

  const handleSignOut = () => {
    logout()
  }

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId)
    // TODO: Handle plan selection
    // - For pay-per-use: Just close modal (payment happens per analysis)
    // - For monthly/yearly: Show payment modal or redirect to payment
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

            {authenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="text-text-muted">
                    {user.email?.address || user.wallet?.address?.slice(0, 6) + '...' + user.wallet?.address?.slice(-4)}
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
                  disabled={!ready}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSignIn}
                disabled={!ready}
              >
                {ready ? 'Sign In' : 'Loading...'}
              </Button>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
