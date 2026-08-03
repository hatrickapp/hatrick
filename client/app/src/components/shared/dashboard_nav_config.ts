import type { ComponentType, SVGProps } from 'react'
import { ListChecks, Trophy, UserRound } from 'lucide-react'
import { FootballFieldIcon } from '@/components/shared/football_field_icon'
import { ROUTES } from '@/lib/constants'
import type { UserProfileResponse } from '@/types/authentication_types'

export type DashboardNavItem = {
  title: string
  url: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  match: (pathname: string) => boolean
}

export function get_dashboard_nav_items(profile?: UserProfileResponse | null): DashboardNavItem[] {
  const publicProfileUrl = profile?.username
    ? ROUTES.DASHBOARD_USER_PROFILE.replace(':username', encodeURIComponent(profile.username))
    : ROUTES.DASHBOARD_PROFILE

  return [
    {
      title: 'Matches',
      url: ROUTES.DASHBOARD_MATCHES,
      icon: FootballFieldIcon,
      match: (pathname) => pathname === ROUTES.DASHBOARD_MATCHES || pathname.startsWith(`${ROUTES.DASHBOARD_MATCHES}/`),
    },
    {
      title: 'Predictions',
      url: ROUTES.DASHBOARD_PREDICTIONS,
      icon: ListChecks,
      match: (pathname) => pathname === ROUTES.DASHBOARD_PREDICTIONS,
    },
    {
      title: 'Leagues',
      url: ROUTES.DASHBOARD_LEAGUES,
      icon: Trophy,
      match: (pathname) => pathname === ROUTES.DASHBOARD_LEAGUES,
    },
    {
      title: 'Profile',
      url: publicProfileUrl,
      icon: UserRound,
      match: (pathname) => pathname.startsWith('/dashboard/users/'),
    },
  ]
}
