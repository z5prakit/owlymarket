'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { SubscribeModal } from '@/components/subscription/SubscribeModal'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

type Chain = 'base' | 'solana'

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
  const [selectedChain, setSelectedChain] = useState<Chain>('base')

  // EVM (Base) wallet
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { open: openEvmModal } = useWeb3Modal()

  // Solana wallet
  const { publicKey: solanaPublicKey, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet()

  const walletAddress = selectedChain === 'base' ? evmAddress : solanaPublicKey?.toString()
  const isConnected = selectedChain === 'base' ? isEvmConnected : isSolanaConnected

  // Fetch user stats when connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetch(`/api/user/me?address=${walletAddress}`)
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(err => console.error('Error fetching user stats:', err))
    } else {
      setUserStats(null)
    }
  }, [isConnected, walletAddress])

  const handleSignIn = () => {
    if (selectedChain === 'base') {
      openEvmModal()
    }
    // Solana: WalletMultiButton handles this automatically
  }

  const handleSignOut = () => {
    if (selectedChain === 'base') {
      disconnectEvm()
    } else {
      disconnectSolana()
    }
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

            {/* Chain Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedChain('base')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  selectedChain === 'base'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Base
              </button>
              <button
                onClick={() => setSelectedChain('solana')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  selectedChain === 'solana'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Solana
              </button>
            </div>

            {/* Wallet Connection */}
            {selectedChain === 'base' ? (
              // Base (EVM) Wallet
              isEvmConnected && evmAddress ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <div className="text-text-muted">
                      {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                    </div>
                    {userStats?.dailyUsage && (
                      <div className={`text-xs ${userStats.dailyUsage.remaining > 0 ? 'text-primary' : 'text-error'}`}>
                        {userStats.dailyUsage.remaining}/{userStats.dailyUsage.limit} analyses left today
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="primary" size="sm" onClick={handleSignIn}>
                  Connect Wallet
                </Button>
              )
            ) : (
              // Solana Wallet
              <WalletMultiButton />
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
