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

// DEPRECATED: This file is no longer used
// We now use Web3Provider with WalletConnect instead of Privy
export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
