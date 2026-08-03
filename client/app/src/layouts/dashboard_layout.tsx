import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/shared/page_loader'
import { DashboardRouteLoader } from '@/components/shared/dashboard_route_loader'
import { TopNav } from '@/components/shared/top_nav'
import { MobileBottomNav } from '@/components/shared/mobile_bottom_nav'
import { SessionExpiredOverlay } from '@/components/shared/session_expired_overlay'
import { OfflineDashboardState } from '@/components/shared/offline_dashboard_state'
import { warm_authenticated_app_cache } from '@/controllers/app_boot_controller'
import { load_profile } from '@/controllers/dashboard_controller'
import { HATRICK_CACHE_UPDATED_EVENT } from '@/controllers/cache_orchestrator'
import { get_cached_league_detail, get_cached_leagues_config, get_cached_leagues_home } from '@/controllers/leagues_controller'
import { get_cached_prediction_history } from '@/controllers/predictions_controller'
import { get_cached_match_detail, get_cached_matches } from '@/controllers/sports_controller'
import { USERS_CACHE_UPDATED_EVENT, get_cached_public_user_profile } from '@/controllers/users_controller'
import { useNetworkStatus } from '@/hooks/use_network_status'
import { start_hatrick_realtime, stop_hatrick_realtime } from '@/lib/hatrick_realtime'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { use_dashboard_store } from '@/store/dashboard_store'

function cached_route_is_ready(pathname: string): boolean {
  if (pathname === ROUTES.DASHBOARD_MATCHES) return get_cached_matches('today') !== null
  if (pathname === ROUTES.DASHBOARD_PREDICTIONS) return get_cached_prediction_history() !== null
  if (pathname === ROUTES.DASHBOARD_LEAGUES) return get_cached_leagues_home() !== null && get_cached_leagues_config() !== null
  if (pathname === ROUTES.DASHBOARD_PROFILE || pathname.startsWith('/dashboard/settings')) return true

  if (pathname.startsWith(`${ROUTES.DASHBOARD_MATCHES}/`)) {
    const matchId = pathname.slice(`${ROUTES.DASHBOARD_MATCHES}/`.length)
    return Boolean(matchId && get_cached_match_detail(matchId))
  }

  if (pathname.startsWith('/dashboard/users/')) {
    const username = decodeURIComponent(pathname.slice('/dashboard/users/'.length))
    return Boolean(username && get_cached_public_user_profile(username))
  }

  if (pathname.startsWith('/dashboard/leagues/')) {
    const leagueId = pathname.slice('/dashboard/leagues/'.length)
    return Boolean(leagueId && get_cached_league_detail(leagueId))
  }

  return false
}

function offline_route_copy(pathname: string): { title: string; description?: string } {
  if (pathname === ROUTES.DASHBOARD_MATCHES) {
    return { title: "Today's Matches", description: 'Pick the outcome, BTTS, and anytime scorer before each match starts.' }
  }
  if (pathname === ROUTES.DASHBOARD_PREDICTIONS) {
    return { title: 'My Predictions', description: 'Track your picks, points, and performance.' }
  }
  if (pathname === ROUTES.DASHBOARD_LEAGUES) {
    return { title: 'Leagues', description: 'Create private leagues, join by invitation, and compete.' }
  }
  if (pathname === ROUTES.DASHBOARD_PROFILE || pathname.startsWith('/dashboard/settings')) {
    return { title: 'Account Settings', description: 'Manage your profile, security, and account preferences' }
  }
  if (pathname.startsWith('/dashboard/users/')) return { title: 'Profile' }
  if (pathname.startsWith(`${ROUTES.DASHBOARD_MATCHES}/`)) return { title: 'Match' }
  return { title: 'Hatrick' }
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = use_dashboard_store((s) => s.profile)
  const isOnline = useNetworkStatus()
  const [profileChecked, setProfileChecked] = useState(Boolean(profile))
  const [, setCacheVersion] = useState(0)

  useEffect(() => {
    if (!isOnline) {
      stop_hatrick_realtime()
      return
    }

    let cancelled = false
    warm_authenticated_app_cache()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) start_hatrick_realtime()
      })
    return () => {
      cancelled = true
      stop_hatrick_realtime()
    }
  }, [isOnline])

  useEffect(() => {
    const updateCacheVersion = () => setCacheVersion((value) => value + 1)
    window.addEventListener(HATRICK_CACHE_UPDATED_EVENT, updateCacheVersion)
    window.addEventListener(USERS_CACHE_UPDATED_EVENT, updateCacheVersion)
    return () => {
      window.removeEventListener(HATRICK_CACHE_UPDATED_EVENT, updateCacheVersion)
      window.removeEventListener(USERS_CACHE_UPDATED_EVENT, updateCacheVersion)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('hatrick-app-shell')
    document.body.classList.add('hatrick-app-shell')

    return () => {
      document.documentElement.classList.remove('hatrick-app-shell')
      document.body.classList.remove('hatrick-app-shell')
    }
  }, [])

  useEffect(() => {
    if (!profile) {
      load_profile()
        .catch(() => undefined)
        .finally(() => setProfileChecked(true))
      return
    }
    if (!profile.username_setup_completed && location.pathname !== ROUTES.USERNAME_SETUP) {
      navigate(ROUTES.USERNAME_SETUP, { replace: true })
    }
  }, [location.pathname, navigate, profile])

  const shouldAnimateRoute = cached_route_is_ready(location.pathname)
  const offlineCopy = offline_route_copy(location.pathname)
  async function retry_offline_load() {
    await warm_authenticated_app_cache()
    await start_hatrick_realtime()
  }

  if ((!profileChecked && !profile) || !profile) return <PageLoader />

  return (
    <div className="mx-auto flex h-[100svh] min-h-0 w-full max-w-[430px] flex-col bg-background sm:max-w-[520px] md:max-w-[720px] lg:max-w-[920px]">
      <SessionExpiredOverlay />
      <TopNav />
      <main className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden overscroll-none">
        {!isOnline ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-background">
            <div className="mx-auto flex w-full flex-1 flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5 sm:px-6 sm:pb-8 sm:pt-8">
              <div className="border-b border-border/40 pb-6">
                <h1 className="text-2xl font-medium tracking-tight">{offlineCopy.title}</h1>
                {offlineCopy.description ? <p className="mt-2 text-sm text-muted-foreground/60">{offlineCopy.description}</p> : null}
              </div>
              <OfflineDashboardState onRetryOnline={retry_offline_load} />
            </div>
          </div>
        ) : (
          <Suspense fallback={<DashboardRouteLoader />}>
            <div key={location.pathname} className={cn('flex min-h-0 flex-1 flex-col', shouldAnimateRoute && 'animate-content-in')}>
              <Outlet />
            </div>
          </Suspense>
        )}
      </main>
      <MobileBottomNav />
    </div>
  )
}
