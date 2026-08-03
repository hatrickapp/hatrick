import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  LeaguesSkeleton,
  MatchDetailSkeleton,
  MatchesSkeleton,
  PredictionsSkeleton,
  ProfileSkeleton,
  PublicProfileSkeleton,
  SettingsListSkeleton,
} from '@/components/shared/dashboard_skeletons'
import { ROUTES } from '@/lib/constants'

function DashboardPageFrame({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto flex w-full flex-col gap-8 px-4 pb-8 pt-5 sm:px-6 sm:py-8">
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground/60">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

function is_match_detail_path(pathname: string): boolean {
  return pathname.startsWith(`${ROUTES.DASHBOARD_MATCHES}/`) && pathname !== ROUTES.DASHBOARD_MATCHES
}

export function DashboardRouteLoader() {
  const { pathname } = useLocation()

  if (is_match_detail_path(pathname)) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="mx-auto flex w-full flex-col px-4 pb-8 pt-5 sm:px-6 sm:py-8">
          <MatchDetailSkeleton />
        </div>
      </div>
    )
  }

  if (pathname === ROUTES.DASHBOARD_MATCHES) {
    return (
      <DashboardPageFrame title="Today's Matches" description="Pick the outcome, BTTS, and anytime scorer before each match starts.">
        <MatchesSkeleton />
      </DashboardPageFrame>
    )
  }

  if (pathname === ROUTES.DASHBOARD_PREDICTIONS) {
    return (
      <DashboardPageFrame title="My Predictions" description="Track your picks, points, and Matchweek performance.">
        <PredictionsSkeleton />
      </DashboardPageFrame>
    )
  }

  if (pathname === ROUTES.DASHBOARD_LEAGUES) {
    return (
      <DashboardPageFrame title="Leagues" description="Create private leagues, join by invitation, and compete.">
        <LeaguesSkeleton />
      </DashboardPageFrame>
    )
  }

  if (pathname.startsWith('/dashboard/users/')) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="mx-auto flex w-full flex-col px-4 pb-8 pt-5 sm:px-6 sm:py-8">
          <PublicProfileSkeleton />
        </div>
      </div>
    )
  }

  if (pathname === ROUTES.DASHBOARD_PROFILE) {
    return (
      <DashboardPageFrame title="Account Settings" description="Manage your profile, security, and account preferences">
        <ProfileSkeleton />
      </DashboardPageFrame>
    )
  }

  if (pathname.startsWith('/dashboard/settings')) {
    return (
      <DashboardPageFrame title="Account Settings" description="Manage your profile, security, and account preferences">
        <SettingsListSkeleton />
      </DashboardPageFrame>
    )
  }

  return (
    <div className="min-h-0 flex-1 bg-background" aria-hidden="true" />
  )
}
