import { Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import storeLinks from '@/config/mobile_store_links.json'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const plusFeatures = [
  'Create up to 20 leagues',
  'Choose competitions',
  'Custom scoring',
  'Late join controls',
  'Plus Profile Badge',
  'Change your username',
  'Priority Support',
]

const freeItems = [
  { text: 'Predict and earn points forever', available: true },
  { text: 'Global ranking and rank progress', available: true },
  { text: 'Join leagues by invitation', available: true },
  { text: 'Create up to 1 league only', available: false },
  { text: 'All competitions only', available: false },
  { text: 'Default scoring only', available: false },
  { text: 'No Plus Profile Badge', available: false },
]

type MobilePlatform = 'ios' | 'android' | 'desktop'

function get_mobile_platform(): MobilePlatform {
  const userAgent = navigator.userAgent || ''
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIos) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  return 'desktop'
}

function PlanLine({ text, available, gold = false }: { text: string; available: boolean; gold?: boolean }) {
  const Icon = available ? Check : X

  return (
    <li className="flex items-center gap-2.5 py-2.5 sm:gap-3 sm:py-3">
      <Icon className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', available ? (gold ? 'text-[#D4AF37]' : 'text-primary') : 'text-muted-foreground/45')} />
      <span className={cn('text-[13px] font-medium leading-5 sm:text-sm', available ? 'text-foreground' : 'text-muted-foreground/65')}>
        {text}
      </span>
    </li>
  )
}

export function PlansSection() {
  const navigate = useNavigate()
  const platform = get_mobile_platform()
  const ctaLabel = platform === 'android' ? 'Get it on Google Play' : platform === 'ios' ? 'Download on App Store' : 'Download Hatrick'

  function download() {
    if (platform === 'ios') {
      window.location.assign(storeLinks.ios)
      return
    }
    if (platform === 'android') {
      window.location.assign(storeLinks.android)
      return
    }
    navigate(ROUTES.DOWNLOAD_IOS)
  }

  return (
    <section id="plans" className="border-b border-border/40">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Plans</p>
          <h2 className="mx-auto mt-3 max-w-sm text-[1.65rem] font-medium leading-tight tracking-tight sm:mt-4 sm:max-w-2xl sm:text-3xl">Start free, unlock deeper leagues with Plus</h2>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground sm:hidden">
            Free keeps predictions open forever. Plus gives league creators more control.
          </p>
          <p className="mx-auto mt-4 hidden max-w-2xl text-sm leading-7 text-muted-foreground sm:block">
            Free keeps predictions open for everyone. Plus adds the league controls, profile perks, and flexibility for people who want to run their own table properly.
          </p>
        </div>

        <div className="mt-7 border-y border-border/40 sm:mt-9 lg:grid lg:grid-cols-2">
          <div className="py-6 sm:py-7 lg:pr-10">
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#B88A16]">Plus</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h3 className="text-xl font-medium tracking-tight sm:text-2xl">For serious leagues</h3>
              <p className="shrink-0 text-sm font-medium text-[#B88A16]">$1.99/month</p>
            </div>
            <ul className="mt-4 divide-y divide-border/30 sm:mt-5">
              {plusFeatures.map((feature) => (
                <PlanLine key={feature} text={feature} available gold />
              ))}
            </ul>
            <Button
              type="button"
              onClick={download}
              className="mt-6 h-11 w-full border-black bg-[#D4AF37] text-foreground shadow-[1.5px_1.5px_0_#000] hover:bg-[#D4AF37]/90 sm:mt-7 sm:w-auto"
            >
              {ctaLabel}
            </Button>
          </div>

          <div className="border-t border-border/40 py-6 sm:py-7 lg:border-l lg:border-t-0 lg:pl-10">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Free</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h3 className="text-xl font-medium tracking-tight sm:text-2xl">For every fan</h3>
              <p className="shrink-0 text-sm font-medium text-muted-foreground">$0 forever</p>
            </div>
            <ul className="mt-4 divide-y divide-border/30 sm:mt-5">
              {freeItems.map((item) => (
                <PlanLine key={item.text} text={item.text} available={item.available} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
