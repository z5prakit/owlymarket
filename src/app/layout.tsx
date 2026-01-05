import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import { Footer } from '@/components/layout/Footer'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { siteConfig } from '@/config/site'

// Import Header dynamically to avoid SSR issues with WalletConnect
const Header = dynamic(() => import('@/components/layout/Header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">{siteConfig.name}</div>
      </div>
    </header>
  ),
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  other: {
    'base:app_id': '695552f74d3a403912ed87ba',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text`}>
        <Web3Provider>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}
