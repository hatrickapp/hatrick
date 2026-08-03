import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-left text-lg font-medium tracking-tight">Hatrick</p>
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-6 sm:gap-y-3">
          <p>Hatrick. All rights reserved.</p>
          <nav aria-label="Footer legal links" className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/pricing" className="shrink-0 font-medium transition-colors hover:text-primary">Pricing Terms</Link>
            <Link to={ROUTES.PRIVACY_POLICY} className="shrink-0 font-medium transition-colors hover:text-primary">Privacy Policy</Link>
            <Link to={ROUTES.TERMS_OF_SERVICE} className="shrink-0 font-medium transition-colors hover:text-primary">Terms of Service</Link>
          </nav>
          <a href="https://www.instagram.com/hatrick.app" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-primary">
            <Instagram className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
