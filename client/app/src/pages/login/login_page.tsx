import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppMark } from '@/components/shared/app_mark'
import { useTypingEffect } from '@/hooks/use_typing_effect'
import { OAuthButtons } from '@/components/shared/oauth_buttons'
import { APP_BOOT_SPLASH_HIDDEN_EVENT, APP_BOOT_TYPING_SPEED_MS } from '@/lib/animation_constants'
import { APP_NAME, ROUTES } from '@/lib/constants'

export function LoginPage() {
  const full_title = `Continue to ${APP_NAME}`
  const hasTyped = Boolean((window as Window & { __hatrickLoginTitleTyped?: boolean }).__hatrickLoginTitleTyped)
  const [title_ready, set_title_ready] = useState(
    () => hasTyped || Boolean((window as Window & { __hatrickBootSplashHidden?: boolean }).__hatrickBootSplashHidden),
  )
  const typed_title = useTypingEffect(title_ready && !hasTyped ? full_title : '', APP_BOOT_TYPING_SPEED_MS)
  const title = hasTyped ? full_title : typed_title

  useEffect(() => {
    if (typed_title === full_title) {
      ;(window as Window & { __hatrickLoginTitleTyped?: boolean }).__hatrickLoginTitleTyped = true
    }
  }, [typed_title, full_title])

  useEffect(() => {
    if (title_ready) return

    let frame_id: number | null = null

    const start_title_animation = () => {
      frame_id = window.requestAnimationFrame(() => set_title_ready(true))
    }

    window.addEventListener(APP_BOOT_SPLASH_HIDDEN_EVENT, start_title_animation, { once: true })
    return () => {
      window.removeEventListener(APP_BOOT_SPLASH_HIDDEN_EVENT, start_title_animation)
      if (frame_id !== null) window.cancelAnimationFrame(frame_id)
    }
  }, [title_ready])

  const render_title = (text: string) => {
    const target = APP_NAME
    const start = full_title.indexOf(target)
    const end = start + target.length

    return (
      <>
        {text.slice(0, start)}
        {text.length > start && (
          <span style={{ color: '#3F9B0B' }}>
            {text.slice(start, end)}
          </span>
        )}
        {text.length > end && text.slice(end)}
      </>
    )
  }

  return (
    <div className="-translate-y-6 flex flex-col gap-7 sm:-translate-y-8 lg:gap-9">
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          <AppMark className="h-32 lg:h-40" markClassName="h-24 w-24 lg:h-32 lg:w-32" textClassName="sr-only" />
        </div>
        <h1 className="min-h-[28px] text-xl font-medium tracking-tight text-foreground lg:min-h-9 lg:text-2xl">
          <span className="relative inline-block whitespace-nowrap">
            <span className="invisible" aria-hidden="true">
              Continue to <span>{APP_NAME}</span>
            </span>
            <span className="absolute inset-x-0 top-0 text-left">
              {render_title(title)}
            </span>
          </span>
        </h1>
        <p className="mt-3 max-w-[280px] text-sm leading-6 text-muted-foreground/65 lg:max-w-sm lg:text-base">
          One tap. Secure. No passwords.
        </p>
      </div>

      <OAuthButtons />

      <div className="flex flex-col gap-3 px-5 text-center">
        <p className="text-xs leading-5 text-muted-foreground/70 lg:text-sm">
          Join football fans competing every matchweek.
        </p>
        <p className="text-[11px] leading-5 text-muted-foreground/60 lg:text-xs">
          By continuing, you agree to our{' '}
          <Link to={ROUTES.TERMS_OF_SERVICE} state={{ from: ROUTES.LOGIN }} className="font-medium text-foreground underline underline-offset-4">Terms</Link>
          ,{' '}
          <Link to={ROUTES.PRIVACY_POLICY} state={{ from: ROUTES.LOGIN }} className="font-medium text-foreground underline underline-offset-4">Privacy Policy</Link>
          , and{' '}
          <Link to={ROUTES.PRICING_TERMS} state={{ from: ROUTES.LOGIN }} className="font-medium text-foreground underline underline-offset-4">Pricing Terms</Link>
          .
        </p>
      </div>
    </div>
  )
}
