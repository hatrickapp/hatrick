import type { AuthenticatedUser, UserProfileResponse, UserSessionItem, UserDeviceItem } from './authentication_types'

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
  sessions: UserSessionItem[]
  devices: UserDeviceItem[]
  set_profile: (profile: UserProfileResponse | null) => void
  set_sessions: (sessions: UserSessionItem[]) => void
  set_devices: (devices: UserDeviceItem[]) => void
}

export interface UiStoreState {
  top_nav_back: (() => void) | null
  hide_top_nav_search: boolean
  set_top_nav_back: (handler: (() => void) | null) => void
  set_hide_top_nav_search: (hidden: boolean) => void
}
