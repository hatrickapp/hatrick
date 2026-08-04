import type { AuthenticatedUser, UserProfileResponse } from './authentication_types'
import type { BillingStatusResponse } from './billing_types'

export interface AuthStoreState {
  user: AuthenticatedUser | null
  is_authenticated: boolean
  is_loading: boolean
  set_user: (user: AuthenticatedUser | null) => void
  set_loading: (loading: boolean) => void
  clear: () => void
}

export interface DashboardStoreState {
  profile: UserProfileResponse | null
  profile_updated_at: number
  billing_status: BillingStatusResponse | null
  billing_status_updated_at: number
  set_profile: (profile: UserProfileResponse | null) => void
  set_billing_status: (status: BillingStatusResponse | null) => void
  clear_dashboard: () => void
}

export interface UiStoreState {
  top_nav_back: (() => void) | null
  hide_top_nav_search: boolean
  set_top_nav_back: (handler: (() => void) | null) => void
  set_hide_top_nav_search: (hidden: boolean) => void
}
