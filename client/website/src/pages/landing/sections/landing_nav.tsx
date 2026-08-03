import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { LANDING_SCROLL_STATE_KEY, scroll_to_landing_section, type LandingScrollTarget } from '../landing_scroll'

export function LandingNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSectionClick = (target: LandingScrollTarget) => {
    if (location.pathname === ROUTES.ROOT) {
      scroll_to_landing_section(target)
      return
    }

    navigate(ROUTES.ROOT, { state: { [LANDING_SCROLL_STATE_KEY]: target } })
  }

  const sectionLinks: { label: string; target: LandingScrollTarget }[] = [
    { label: 'How it works', target: 'how-it-works' },
    { label: 'Ranks', target: 'ranks' },
    { label: 'Leagues', target: 'leagues' },
    { label: 'Plans', target: 'plans' },
  ]

  return (
    <header className="dotted-background sticky top-0 z-50 border-b border-border/30 bg-background">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link to={ROUTES.ROOT} className="shrink-0">
          <span className="text-xl font-medium tracking-normal text-foreground">Hatrick</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {sectionLinks.map((item) => (
            <Button
              key={item.target}
              type="button"
              variant="ghost"
              onClick={() => handleSectionClick(item.target)}
              className="h-auto p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-primary"
            >
              {item.label}
            </Button>
          ))}
          <Link to={ROUTES.FAQ} className="transition-colors hover:text-primary">FAQ</Link>
          <Link to={ROUTES.SUPPORT_US} className="transition-colors hover:text-primary">Support us</Link>
        </nav>
        <div />
      </div>
    </header>
  )
}
