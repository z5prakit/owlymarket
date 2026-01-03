import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { base } from 'viem/chains'

// Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

const metadata = {
  name: 'OwlyMarket',
  description: 'AI Research for Prediction Markets',
  url: 'https://owlymarket.vercel.app',
  icons: ['https://owlymarket.vercel.app/logo.png']
}

const chains = [base] as const

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// Create modal
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: false,
    themeMode: 'light',
  })
}
