import { clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'

// Solana RPC endpoint
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')

// Solana USDC mint address (mainnet)
export const SOLANA_USDC_MINT =
  process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ||
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

// Supported wallets
export const getSolanaWallets = () => {
  return [
    new PhantomWalletAdapter(), // Phantom wallet
    // Add more wallets here if needed
  ]
}
