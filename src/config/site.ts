/**
 * Site metadata and configuration
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'OwlyMarket',
  description:
    'AI-powered prediction market analysis using advanced multi-agent systems and Bayesian probability',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/owlymarket',
    github: 'https://github.com/owlymarket',
  },
}

export const navItems = [
  {
    title: 'Features',
    href: '/#features',
  },
  {
    title: 'How It Works',
    href: '/#how-it-works',
  },
  {
    title: 'Pricing',
    href: '/#pricing',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    requireAuth: true,
  },
]
