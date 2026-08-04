import { useEffect, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  ArrowLeft,
  LogOut,
  Search,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppMark } from "@/components/shared/app_mark"
import { LoadingSpinner } from "@/components/shared/loading_spinner"
import { handle_logout } from "@/controllers/auth_controller"
import { ROUTES } from "@/lib/constants"
import { load_profile } from "@/controllers/dashboard_controller"
import { use_dashboard_store } from "@/store/dashboard_store"
import { use_ui_store } from "@/store/ui_store"

export function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = use_dashboard_store((s) => s.profile)
  const topNavBack = use_ui_store((s) => s.top_nav_back)
  const hideTopNavSearch = use_ui_store((s) => s.hide_top_nav_search)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!profile) {
      load_profile().catch(() => undefined)
    }
  }, [profile])

  const isProfileSection = location.pathname.startsWith('/dashboard/users/')
  const isSettingsSection = location.pathname.startsWith('/dashboard/settings')
  const isSearchSection = location.pathname === ROUTES.DASHBOARD_SEARCH

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await Promise.all([
        handle_logout(),
        new Promise((resolve) => window.setTimeout(resolve, 1000)),
      ])
    } finally {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto grid h-14 w-full max-w-[430px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:h-16 sm:max-w-[520px] sm:px-6 md:max-w-[720px] lg:max-w-[920px]">
        {topNavBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={topNavBack}
            aria-label="Back"
            className="h-10 w-10 rounded-lg text-foreground sm:h-12 sm:w-12"
          >
            <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
        ) : (
          <Link to={ROUTES.DASHBOARD} className="flex h-full shrink-0 items-center  transition-all duration-300">
            <AppMark markClassName="h-10 w-10 sm:h-12 sm:w-12" textClassName="hidden text-lg sm:inline" />
          </Link>
        )}

        <div className="flex items-center justify-end gap-3 shrink-0">
          {!hideTopNavSearch && !isSearchSection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={() => {
                const from = `${location.pathname}${location.search}${location.hash}`
                navigate(ROUTES.DASHBOARD_SEARCH, { state: { from } })
              }}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search users</span>
            </Button>
          )}
          {isSettingsSection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={signingOut}
              onClick={signOut}
              className="h-10 w-10 rounded-lg text-destructive   disabled:pointer-events-none disabled:opacity-70"
              aria-label={signingOut ? 'Signing out' : 'Sign out'}
            >
              {signingOut ? <LoadingSpinner size="sm" /> : <LogOut className="h-5 w-5" />}
            </Button>
          )}
          {isProfileSection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.DASHBOARD_PROFILE)}
              className="h-10 w-10 rounded-lg"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
