import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import logoSrc from '@/assets/logo.png'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { Button } from '@/components/ui/button'
import { handle_purchase_plus } from '@/controllers/billing_controller'
import { get_cached_leagues_config, load_leagues_config } from '@/controllers/leagues_controller'
import { APP_BOOT_TYPING_SPEED_MS } from '@/lib/animation_constants'
import { ROUTES } from '@/lib/constants'
import { get_upgrade_return_path, get_upgrade_return_state } from '@/lib/upgrade_navigation'
import { get_plus_price_label, RevenueCatUserCancelledError } from '@/lib/revenuecat'
import { useTypingEffect } from '@/hooks/use_typing_effect'
import { use_auth_store } from '@/store/auth_store'
import type { PlusOfferingItem } from '@/types/league_types'

export function UpgradePage() {
  const location = useLocation()
  const user = use_auth_store((state) => state.user)
  const hasTyped = Boolean((window as Window & { __hatrickUpgradeTitleTyped?: boolean }).__hatrickUpgradeTitleTyped)
  const [offering, setOffering] = useState<PlusOfferingItem | null>(get_cached_leagues_config()?.plus_offering ?? null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [storePriceLabel, setStorePriceLabel] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const typedUpgrade = useTypingEffect(hasTyped ? '' : 'Upgrade to Plus', APP_BOOT_TYPING_SPEED_MS)
  const title = hasTyped ? 'Upgrade to Plus' : typedUpgrade
  const typedPrefix = title.slice(0, 'Upgrade to '.length)
  const typedPlus = title.slice('Upgrade to '.length)
  const returnPath = get_upgrade_return_path(location.state)
  const returnState = get_upgrade_return_state(location.state)

  useEffect(() => {
    if (typedUpgrade === 'Upgrade to Plus') {
      ;(window as Window & { __hatrickUpgradeTitleTyped?: boolean }).__hatrickUpgradeTitleTyped = true
    }
  }, [typedUpgrade])

  useEffect(() => {
    document.documentElement.classList.add('hatrick-upgrade-lock')
    document.body.classList.add('hatrick-upgrade-lock')

    let cancelled = false
    load_leagues_config()
      .then((response) => {
        if (!cancelled) setOffering(response.plus_offering)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      document.documentElement.classList.remove('hatrick-upgrade-lock')
      document.body.classList.remove('hatrick-upgrade-lock')
    }
  }, [])

  useEffect(() => {
    if (!user?.user_id) return
    let cancelled = false
    get_plus_price_label(user.user_id)
      .then((priceLabel) => {
        if (!cancelled) setStorePriceLabel(priceLabel)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [user?.user_id])

  const buy_plus = async () => {
    if (!user?.user_id) return
    setMessage(null)
    setPurchaseLoading(true)
    try {
      const result = await handle_purchase_plus(user.user_id)
      setMessage(result.active ? 'Hatrick Plus is active.' : 'Purchase received. Plus will activate as soon as the store confirms it.')
    } catch (error) {
      if (!(error instanceof RevenueCatUserCancelledError)) {
        setMessage(error instanceof Error ? error.message : 'Could not start the purchase.')
      }
    } finally {
      setPurchaseLoading(false)
    }
  }

  return (
    <main className="fixed inset-0 z-[60] h-svh overflow-hidden overscroll-none bg-background bg-dot-grid px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1rem)] text-foreground animate-upgrade-page-in">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <BackIconButton to={returnPath} state={returnState} className="relative z-10 -ml-2" />

        <section className="flex min-h-0 flex-1 flex-col justify-center">
          <div className="-translate-y-3">
            <div className="flex justify-center">
              <img src={logoSrc} alt="Hatrick" className="h-16 w-16 object-contain min-[390px]:h-20 min-[390px]:w-20" />
            </div>

            <div className="mt-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Hatrick Plus</p>
              <h1 className="mt-2 flex justify-center text-[2rem] font-medium leading-[1.02] tracking-normal text-foreground min-[390px]:text-4xl">
                <span className="relative inline-block whitespace-nowrap">
                  <span className="invisible" aria-hidden="true">
                    Upgrade to <span>Plus</span>
                  </span>
                  <span className="absolute inset-x-0 top-0 text-left">
                    {typedPrefix}<span className="text-[#D4AF37]">{typedPlus}</span>
                  </span>
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[13px] font-medium leading-5 text-muted-foreground min-[390px]:text-sm">
                Unlock deeper league controls, stronger profile tools, and more room to build your football circles.
              </p>
            </div>

            <div className="mt-5 grid gap-3.5 border-y border-border/30 py-4 min-[390px]:gap-4">
              {(offering?.features ?? []).map((feature) => (
                <div key={feature} className="flex min-w-0 items-center gap-3">
                  <Check className="size-3.5 shrink-0 text-[#D4AF37]" />
                  <span className="text-sm font-medium leading-5 text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[2rem] font-medium leading-none tracking-normal text-foreground min-[390px]:text-3xl">{storePriceLabel ?? 'Price shown in store'}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Cancel anytime</p>
          </div>

          <Button
            type="button"
            onClick={buy_plus}
            disabled={purchaseLoading}
            className="mt-4 h-11 w-full border-black bg-[#D4AF37] text-foreground shadow-[1.5px_1.5px_0_#000]  min-[390px]:h-12"
          >
            {purchaseLoading ? 'Opening Store...' : offering?.cta_label ?? 'Get Hatrick Plus'}
          </Button>
          {message && (
            <p className="mx-auto mt-2 max-w-xs text-center text-xs font-medium leading-5 text-foreground">
              {message}
            </p>
          )}
          <p className="mx-auto mt-3 max-w-xs text-center text-[11px] font-medium leading-5 text-muted-foreground/60">
            Subscription billing is handled through app stores. Review our{' '}
            <Link to={ROUTES.PRIVACY_POLICY} state={{ from: ROUTES.DASHBOARD_UPGRADE }} className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link to={ROUTES.DASHBOARD_PRICING_TERMS} state={{ from: ROUTES.DASHBOARD_UPGRADE }} className="text-foreground underline underline-offset-4">
              Pricing Terms
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
