import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-text-muted text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
