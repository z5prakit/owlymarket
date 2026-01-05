import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect Project ID (optional - will use injected providers if not available)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(), // MetaMask, Rabby, etc.
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})
