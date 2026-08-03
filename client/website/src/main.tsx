import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RouteTitle } from '@/components/shared/route_title'
import { LandingPage } from '@/pages/landing/landing_page'
import { AboutPage } from '@/pages/landing/about_page'
import { SupportUsPage } from '@/pages/landing/support_us_page'
import { FaqPage } from '@/pages/landing/faq_page'
import { AppStoreHandoffPage, GooglePlayHandoffPage } from '@/pages/landing/mobile_store_handoff_page'
import { PricingPage } from '@/pages/landing/pricing_page'
import { PrivacyPolicyPage } from '@/pages/landing/privacy_policy_page'
import { FootballPredictionGamePage, FootballPredictionRulesPage, PrivateFootballLeaguesPage } from '@/pages/landing/seo_article_page'
import { TermsOfServicePage } from '@/pages/landing/terms_of_service_page'
import { APP_NAME, ROUTES } from '@/lib/constants'
import '@/index.css'

const seo = {
  home: {
    title: `${APP_NAME} | Football Prediction Game`,
    description: 'Hatrick is a football prediction game where fans predict match winners, both teams to score, and anytime scorers to earn points, climb ranks, and compete in leagues.',
  },
  about: {
    title: `About ${APP_NAME} | Football Prediction App`,
    description: 'Learn about Hatrick, a football prediction app built for fans who want weekly picks, fair scoring, rankings, and private league competition.',
  },
  support: {
    title: `Support ${APP_NAME} | Football Prediction App`,
    description: 'Support Hatrick and help improve the football prediction experience for fans, leagues, rankings, scoring, and matchweek competition.',
  },
  faq: {
    title: `${APP_NAME} FAQ | Football Prediction Rules And Points`,
    description: 'Find answers about Hatrick predictions, points, ranks, private leagues, supported competitions, usernames, profiles, and responsible gameplay.',
  },
  footballPredictionGame: {
    title: `Football Prediction Game | ${APP_NAME}`,
    description: 'Play Hatrick, a football prediction game for match winners, both teams to score, anytime scorers, points, ranks, and private leagues.',
  },
  privateFootballLeagues: {
    title: `Private Football Prediction Leagues | ${APP_NAME}`,
    description: 'Create private football prediction leagues in Hatrick with invite codes, custom scoring, supported competitions, and live standings.',
  },
  footballPredictionRules: {
    title: `Football Prediction Rules And Points | ${APP_NAME}`,
    description: 'Learn Hatrick football prediction rules for match winners, both teams to score, anytime scorers, points, lock times, and the Hatrick bonus.',
  },
  downloadIos: {
    title: `${APP_NAME} | Download On The App Store`,
    description: 'Download Hatrick on iPhone to make football predictions, earn points, climb ranks, and compete in private leagues every matchweek.',
  },
  downloadAndroid: {
    title: `${APP_NAME} | Download On Google Play`,
    description: 'Download Hatrick on Android to predict football matches, track points, climb rankings, and compete with friends in private leagues.',
  },
  pricing: {
    title: `${APP_NAME} Pricing | Free And Plus Plans`,
    description: 'Compare Hatrick plans for football prediction leagues, including free access, Plus features, league customization, and account benefits.',
  },
  privacy: {
    title: `Privacy Policy | ${APP_NAME}`,
    description: 'Read the Hatrick privacy policy to understand how account, profile, prediction, league, and app data may be collected and used.',
  },
  terms: {
    title: `Terms Of Service | ${APP_NAME}`,
    description: 'Read the Hatrick terms of service for rules about using the football prediction app, accounts, leagues, points, and platform access.',
  },
}

const router = createBrowserRouter([
  { path: ROUTES.ROOT, element: <RouteTitle {...seo.home} path={ROUTES.ROOT}><LandingPage /></RouteTitle> },
  { path: ROUTES.ABOUT_US, element: <RouteTitle {...seo.about} path={ROUTES.ABOUT_US}><AboutPage /></RouteTitle> },
  { path: ROUTES.SUPPORT_US, element: <RouteTitle {...seo.support} path={ROUTES.SUPPORT_US}><SupportUsPage /></RouteTitle> },
  { path: ROUTES.FAQ, element: <RouteTitle {...seo.faq} path={ROUTES.FAQ}><FaqPage /></RouteTitle> },
  { path: ROUTES.FOOTBALL_PREDICTION_GAME, element: <RouteTitle {...seo.footballPredictionGame} path={ROUTES.FOOTBALL_PREDICTION_GAME}><FootballPredictionGamePage /></RouteTitle> },
  { path: ROUTES.PRIVATE_FOOTBALL_LEAGUES, element: <RouteTitle {...seo.privateFootballLeagues} path={ROUTES.PRIVATE_FOOTBALL_LEAGUES}><PrivateFootballLeaguesPage /></RouteTitle> },
  { path: ROUTES.FOOTBALL_PREDICTION_RULES, element: <RouteTitle {...seo.footballPredictionRules} path={ROUTES.FOOTBALL_PREDICTION_RULES}><FootballPredictionRulesPage /></RouteTitle> },
  { path: ROUTES.DOWNLOAD_IOS, element: <RouteTitle {...seo.downloadIos} path={ROUTES.DOWNLOAD_IOS}><AppStoreHandoffPage /></RouteTitle> },
  { path: ROUTES.DOWNLOAD_ANDROID, element: <RouteTitle {...seo.downloadAndroid} path={ROUTES.DOWNLOAD_ANDROID}><GooglePlayHandoffPage /></RouteTitle> },
  { path: ROUTES.PRICING, element: <RouteTitle {...seo.pricing} path={ROUTES.PRICING}><PricingPage /></RouteTitle> },
  { path: ROUTES.PRIVACY_POLICY, element: <RouteTitle {...seo.privacy} path={ROUTES.PRIVACY_POLICY}><PrivacyPolicyPage /></RouteTitle> },
  { path: ROUTES.TERMS_OF_SERVICE, element: <RouteTitle {...seo.terms} path={ROUTES.TERMS_OF_SERVICE}><TermsOfServicePage /></RouteTitle> },
  { path: '*', element: <Navigate to={ROUTES.ROOT} replace /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
