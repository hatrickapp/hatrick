import { useNavigate } from 'react-router-dom'
import appStoreBadge from '@/assets/download-on-the-apple-store.svg'
import googlePlayBadge from '@/assets/get-it-on-google-play.svg'
import storeLinks from '@/config/mobile_store_links.json'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

type MobilePlatform = 'ios' | 'android' | 'desktop'

function get_mobile_platform(): MobilePlatform {
  const userAgent = navigator.userAgent || ''
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIos) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  return 'desktop'
}

export function MobileStoreBadge() {
  const navigate = useNavigate()
  const platform = get_mobile_platform()

  const openStore = (target: 'ios' | 'android') => {
    if (platform !== 'desktop') {
      window.location.assign(target === 'ios' ? storeLinks.ios : storeLinks.android)
      return
    }

    navigate(target === 'ios' ? ROUTES.DOWNLOAD_IOS : ROUTES.DOWNLOAD_ANDROID)
  }

  const showIos = platform !== 'android'
  const showAndroid = platform !== 'ios'

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {showIos && (
        <Button type="button" variant="ghost" onClick={() => openStore('ios')} className="h-11 w-auto p-0 shadow-none hover:bg-transparent">
          <img
            src={appStoreBadge}
            alt="Download on the App Store"
            className="h-11 w-auto"
            loading="eager"
            decoding="async"
          />
        </Button>
      )}
      {showAndroid && (
        <Button type="button" variant="ghost" onClick={() => openStore('android')} className="h-11 w-auto p-0 shadow-none hover:bg-transparent">
          <img
            src={googlePlayBadge}
            alt="Get it on Google Play"
            className="h-11 w-auto"
            loading="eager"
            decoding="async"
          />
        </Button>
      )}
    </div>
  )
}
