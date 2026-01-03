'use client'

import { useEffect } from 'react'
// TESTING PHASE: Privy disabled for anonymous access
// import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
// import { base } from 'viem/chains'

// Component to handle user sync on login
// TESTING PHASE: Disabled
/*
function UserSyncHandler() {
  const { authenticated, user } = usePrivy()

  useEffect(() => {
    if (authenticated && user) {
      // Sync user to database
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (data.created) {
            console.log('[UserSync] New user created!')
          } else {
            console.log('[UserSync] Existing user synced')
          }
        })
        .catch(err => console.error('[UserSync] Error:', err))
    }
  }, [authenticated, user])

  return null
}
*/

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  // TESTING PHASE: Skip Privy entirely - render children without provider
  useEffect(() => {
    console.log('[PrivyProvider] TESTING MODE: Privy disabled for anonymous access')
  }, [])

  return <>{children}</>

  /* TESTING PHASE: Original Privy code disabled
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  useEffect(() => {
    console.log('[PrivyProvider] Initializing...')
    console.log('[PrivyProvider] App ID:', appId ? `${appId.slice(0, 10)}...` : 'MISSING')
    if (!appId) {
      console.error('[PrivyProvider] ERROR: NEXT_PUBLIC_PRIVY_APP_ID is not set!')
    }
  }, [appId])

  // During build/prerender, App ID might not be available - just render children
  if (!appId || typeof window === 'undefined') {
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Customize Privy appearance
        appearance: {
          theme: 'light',
          accentColor: '#2F80ED',
        },
        // Login methods - Wallet Connect only
        loginMethods: ['wallet'],
        // Disable embedded wallets
        embeddedWallets: {
          createOnLogin: 'off',
        },
        // Default chain
        defaultChain: base,
        supportedChains: [base],
        // External wallets - Enable Solana wallets
        externalWallets: {
          solana: {
            enabled: true,
          },
        },
      }}
      onSuccess={() => console.log('[PrivyProvider] Login successful')}
    >
      <UserSyncHandler />
      {children}
    </PrivyProvider>
  )
}
