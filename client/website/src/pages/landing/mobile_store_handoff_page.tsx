import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import androidLogo from '@/assets/android-logo.png'
import appleLogo from '@/assets/apple-logo.png'
import appStoreBadge from '@/assets/download-on-the-apple-store.svg'
import googlePlayBadge from '@/assets/get-it-on-google-play.svg'
import appStoreQr from '@/assets/app-store-qr.svg'
import googlePlayQr from '@/assets/google-play-qr.svg'
import storeLinks from '@/config/mobile_store_links.json'
import { ROUTES } from '@/lib/constants'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

type StoreKind = 'ios' | 'android'

function is_mobile_device() {
  const userAgent = navigator.userAgent || ''
  return /Android|iPad|iPhone|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const storeContent = {
  ios: {
    label: 'Apple',
    title: 'Download Hatrick on iPhone',
    subtitle: 'Scan this QR code with your iPhone to open the App Store link.',
    qr: appStoreQr,
    url: storeLinks.ios,
    logo: appleLogo,
    logoClassName: 'h-12 w-10',
    alternateLabel: 'Not an Apple user?',
    alternateBadge: googlePlayBadge,
    alternateAlt: 'Get it on Google Play',
    alternateRoute: ROUTES.DOWNLOAD_ANDROID,
  },
  android: {
    label: 'Android',
    title: 'Download Hatrick on Android',
    subtitle: 'Scan this QR code with your Android phone to open the Google Play link.',
    qr: googlePlayQr,
    url: storeLinks.android,
    logo: androidLogo,
    logoClassName: 'h-11 w-11',
    alternateLabel: 'Not an Android user?',
    alternateBadge: appStoreBadge,
    alternateAlt: 'Download on the App Store',
    alternateRoute: ROUTES.DOWNLOAD_IOS,
  },
} satisfies Record<StoreKind, {
  label: string
  title: string
  subtitle: string
  qr: string
  url: string
  logo: string
  logoClassName: string
  alternateLabel: string
  alternateBadge: string
  alternateAlt: string
  alternateRoute: string
}>

function MobileStoreHandoffPage({ kind }: { kind: StoreKind }) {
  const content = storeContent[kind]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (is_mobile_device()) window.location.assign(content.url)
  }, [content.url])

  return (
    <div className="dotted-background min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <section className="flex w-full max-w-lg flex-col items-center">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">{content.label}</p>
          <h1 className="mt-3 text-2xl font-medium tracking-tight">{content.title}</h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{content.subtitle}</p>

          <a href={content.url} className="relative mt-10 block h-64 w-64 sm:h-72 sm:w-72" target="_blank" rel="noreferrer">
            <img src={content.qr} alt={`${content.label} store QR code`} className="h-full w-full object-contain" />
            <span className="pointer-events-none absolute inset-0 m-auto flex h-14 w-14 items-center justify-center">
              <img src={content.logo} alt="" aria-hidden="true" className={`${content.logoClassName} object-contain`} />
            </span>
          </a>

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-border/40 pt-8">
            <p className="text-sm font-medium text-muted-foreground">{content.alternateLabel}</p>
            <Link to={content.alternateRoute}>
              <img src={content.alternateBadge} alt={content.alternateAlt} className="h-11 w-auto" />
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}

export function AppStoreHandoffPage() {
  return <MobileStoreHandoffPage kind="ios" />
}

export function GooglePlayHandoffPage() {
  return <MobileStoreHandoffPage kind="android" />
}
