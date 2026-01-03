import dynamic from 'next/dynamic'

// Import HomeClient dynamically to avoid SSR issues with WalletConnect
const HomeClient = dynamic(() => import('./HomeClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-text-muted">Loading...</div>
    </div>
  ),
})

export default function HomePage() {
  return <HomeClient />
}
