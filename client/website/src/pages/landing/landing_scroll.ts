export const LANDING_SCROLL_STATE_KEY = 'landingScrollTarget'

export type LandingScrollTarget = 'how-it-works' | 'ranks' | 'leagues' | 'plans'

export function scroll_to_landing_section(target: LandingScrollTarget, behavior: ScrollBehavior = 'smooth') {
  const element = document.getElementById(target)
  if (!element) return

  const headerOffset = 96
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior })
}
