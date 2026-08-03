import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicGuard } from './public_guard'
import { PrivateGuard } from './private_guard'
import { AuthLayout } from '@/layouts/auth_layout'
import { DashboardLayout } from '@/layouts/dashboard_layout'
import { PageLoader } from '@/components/shared/page_loader'
import { RouteTitle } from '@/components/shared/route_title'
import { LoginPage } from '@/pages/login/login_page'
import { OtpPage } from '@/pages/otp/otp_page'
import { UsernameSetupPage } from '@/pages/username/username_setup_page'
import { APP_NAME, ROUTES } from '@/lib/constants'

const SettingsPage = lazy(() => import('@/pages/dashboard/settings/settings_page').then(m => ({ default: m.SettingsPage })))
const SessionsPage = lazy(() => import('@/pages/dashboard/sessions/sessions_page').then(m => ({ default: m.SessionsPage })))
const ProfilePage = lazy(() => import('@/pages/dashboard/profile/profile_page').then(m => ({ default: m.ProfilePage })))
const MatchesPage = lazy(() => import('@/pages/dashboard/matches/matches_page').then(m => ({ default: m.MatchesPage })))
const MatchDetailPage = lazy(() => import('@/pages/dashboard/matches/match_detail_page').then(m => ({ default: m.MatchDetailPage })))
const PredictionsPage = lazy(() => import('@/pages/dashboard/predictions/predictions_page').then(m => ({ default: m.PredictionsPage })))
const LeaguesPage = lazy(() => import('@/pages/dashboard/leagues/leagues_page').then(m => ({ default: m.LeaguesPage })))
const UpgradePage = lazy(() => import('@/pages/dashboard/upgrade/upgrade_page').then(m => ({ default: m.UpgradePage })))
const PricingTermsPage = lazy(() => import('@/pages/dashboard/upgrade/pricing_terms_page').then(m => ({ default: m.PricingTermsPage })))
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/privacy_policy_page').then(m => ({ default: m.PrivacyPolicyPage })))
const TermsOfServicePage = lazy(() => import('@/pages/legal/terms_of_service_page').then(m => ({ default: m.TermsOfServicePage })))
const PublicUserProfilePage = lazy(() => import('@/pages/dashboard/users/public_user_profile_page').then(m => ({ default: m.PublicUserProfilePage })))
const DeleteAccountPage = lazy(() => import('@/pages/dashboard/settings/delete/delete_account_page').then(m => ({ default: m.DeleteAccountPage })))
const SecuritySettingsPage = lazy(() => import('@/pages/dashboard/settings/security/security_settings_page').then(m => ({ default: m.SecuritySettingsPage })))
const BillingSettingsPage = lazy(() => import('@/pages/dashboard/settings/billing/billing_settings_page').then(m => ({ default: m.BillingSettingsPage })))

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.PRICING_TERMS,
    element: <RouteTitle title={`${APP_NAME} | Pricing Terms`}><Suspense fallback={<PageLoader />}><PricingTermsPage /></Suspense></RouteTitle>,
  },
  {
    path: ROUTES.PRIVACY_POLICY,
    element: <RouteTitle title={`${APP_NAME} | Privacy Policy`}><Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense></RouteTitle>,
  },
  {
    path: ROUTES.TERMS_OF_SERVICE,
    element: <RouteTitle title={`${APP_NAME} | Terms`}><Suspense fallback={<PageLoader />}><TermsOfServicePage /></Suspense></RouteTitle>,
  },
  {
    element: <PublicGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <RouteTitle title={`${APP_NAME} | Continue`}><LoginPage /></RouteTitle> },
        ],
      },
    ],
  },
  {
    element: <PrivateGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.USERNAME_SETUP, element: <RouteTitle title={`${APP_NAME} | Username`}><UsernameSetupPage /></RouteTitle> },
          { path: ROUTES.OTP, element: <RouteTitle title={`${APP_NAME} | Verify`}><OtpPage /></RouteTitle> },
        ],
      },
      {
        path: ROUTES.DASHBOARD_UPGRADE,
        element: <RouteTitle title={`${APP_NAME} | Plus`}><Suspense fallback={<PageLoader />}><UpgradePage /></Suspense></RouteTitle>,
      },
      {
        path: ROUTES.DASHBOARD_PRICING_TERMS,
        element: <RouteTitle title={`${APP_NAME} | Pricing Terms`}><Suspense fallback={<PageLoader />}><PricingTermsPage /></Suspense></RouteTitle>,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <Suspense fallback={<PageLoader />}><DashboardLayout /></Suspense>,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD_MATCHES} replace /> },
          { path: 'matches', element: <RouteTitle title={`${APP_NAME} | Matches`}><MatchesPage /></RouteTitle> },
          { path: 'matches/:match_id', element: <RouteTitle title={`${APP_NAME} | Match`}><MatchDetailPage /></RouteTitle> },
          { path: 'predictions', element: <RouteTitle title={`${APP_NAME} | Predictions`}><PredictionsPage /></RouteTitle> },
          { path: 'leagues', element: <RouteTitle title={`${APP_NAME} | Leagues`}><LeaguesPage /></RouteTitle> },
          { path: 'users/:username', element: <RouteTitle title={`${APP_NAME} | User Profile`}><PublicUserProfilePage /></RouteTitle> },
          {
            path: 'settings',
            element: <SettingsPage />,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', element: <RouteTitle title={`${APP_NAME} | Account Profile`}><ProfilePage /></RouteTitle> },
              { path: 'billing', element: <RouteTitle title={`${APP_NAME} | Billing`}><BillingSettingsPage /></RouteTitle> },
              { path: 'security', element: <RouteTitle title={`${APP_NAME} | Security`}><SecuritySettingsPage /></RouteTitle> },
              { path: 'sessions', element: <RouteTitle title={`${APP_NAME} | Sessions`}><SessionsPage /></RouteTitle> },
              { path: 'delete', element: <RouteTitle title={`${APP_NAME} | Delete Account`}><DeleteAccountPage /></RouteTitle> },
            ],
          },
        ],
      },
    ],
  },
])
