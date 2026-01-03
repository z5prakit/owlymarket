'use client'

import { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
// TESTING PHASE: Privy disabled
// import { Button } from '@/components/ui/Button'
// import { SubscribeModal } from '@/components/subscription/SubscribeModal'
// import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'

interface UserStats {
  dailyUsage: {
    used: number
    limit: number
    remaining: number
  }
}

export function Header() {
  // TESTING PHASE: Privy disabled - no authentication UI
  /*
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
  */

  return (
    <>
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
            {/* TESTING PHASE: Sign in/out buttons hidden */}
          </nav>
        </div>
      </header>
    </>
  )
}
