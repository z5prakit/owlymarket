'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useMemo, useState } from 'react'
import { wagmiConfig } from '@/config/wagmi'
import { getSolanaWallets, SOLANA_RPC_URL } from '@/config/solana'

// Import Solana wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

export function MultiChainWalletProvider({ children }: { children: React.ReactNode }) {
  // React Query client for wagmi
  const [queryClient] = useState(() => new QueryClient())

  // Solana wallets
  const wallets = useMemo(() => getSolanaWallets(), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={SOLANA_RPC_URL}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
