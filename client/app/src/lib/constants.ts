const api_origin = import.meta.env.VITE_API_BASE_URL
export const BASE_URL = api_origin || 'https://api.hatrick.app'
export const APP_NAME = 'Hatrick'

export const ROUTES = {
  ROOT: '/',
  ABOUT_US: '/about',
  SUPPORT_US: '/support',
  FAQ: '/faq',
  DOWNLOAD_IOS: '/download/ios',
  DOWNLOAD_ANDROID: '/download/android',
  PRIVACY_POLICY: '/privacy',
  TERMS_OF_SERVICE: '/terms',
  PRICING_TERMS: '/pricing-terms',
  LOGIN: '/login',
  OTP: '/auth/otp',
  USERNAME_SETUP: '/auth/username',
  DASHBOARD: '/dashboard',
  DASHBOARD_MATCHES: '/dashboard/matches',
  DASHBOARD_MATCH_DETAIL: '/dashboard/matches/:match_id',
  DASHBOARD_PREDICTIONS: '/dashboard/predictions',
  DASHBOARD_LEAGUES: '/dashboard/leagues',
  DASHBOARD_SEARCH: '/dashboard/search',
  DASHBOARD_UPGRADE: '/dashboard/upgrade',
  DASHBOARD_PRICING_TERMS: '/dashboard/upgrade/pricing-terms',
  DASHBOARD_USER_PROFILE: '/dashboard/users/:username',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_PROFILE: '/dashboard/settings/profile',
  DASHBOARD_SETTINGS_BILLING: '/dashboard/settings/billing',
  DASHBOARD_SETTINGS_DELETE: '/dashboard/settings/delete',
} as const

export function get_authenticated_home_path(role?: string | null) {
  void role
  return ROUTES.DASHBOARD
}
