import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HeroSection } from './sections/hero_section'
import { GlobalRankingSection } from './sections/global_ranking_section'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'
import { LeaguesSection } from './sections/leagues_section'
import { PlansSection } from './sections/plans_section'
import { PredictionPointsSection } from './sections/prediction_points_section'
import { RanksSection } from './sections/ranks_section'
import { LANDING_SCROLL_STATE_KEY, scroll_to_landing_section, type LandingScrollTarget } from './landing_scroll'
import { ROUTES } from '@/lib/constants'

export function LandingPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state as Partial<Record<typeof LANDING_SCROLL_STATE_KEY, LandingScrollTarget>> | null
    const target = state?.[LANDING_SCROLL_STATE_KEY]
    if (!target) return

    window.requestAnimationFrame(() => scroll_to_landing_section(target))
    navigate(ROUTES.ROOT, { replace: true, state: null })
  }, [location.state, navigate])

  return (
    <div className="dotted-background min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <HeroSection />
        <PredictionPointsSection />
        <RanksSection />
        <LeaguesSection />
        <PlansSection />
        <GlobalRankingSection />
      </main>
      <LandingFooter />
    </div>
  )
}
