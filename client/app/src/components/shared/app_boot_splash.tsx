import { useEffect, useState, type ReactNode } from 'react'
import logo from '@/assets/logo.png'
import { useTypingEffect } from '@/hooks/use_typing_effect'
import { useNetworkStatus } from '@/hooks/use_network_status'
import { warm_authenticated_app_cache } from '@/controllers/app_boot_controller'
import { use_auth_store } from '@/store/auth_store'
import { cn } from '@/lib/utils'
import { APP_BOOT_SPLASH_HIDDEN_EVENT, APP_BOOT_TYPING_SPEED_MS } from '@/lib/animation_constants'

const WORD = 'Hatrick'
const MIN_VISIBLE_MS = 100 + WORD.length * APP_BOOT_TYPING_SPEED_MS + 500
const MAX_BOOT_WAIT_MS = 6000
const EXIT_MS = 220

type BootSplashWindow = Window & { __hatrickBootSplashHidden?: boolean }

function hasBootSplashAlreadyHidden() {
  return Boolean((window as BootSplashWindow).__hatrickBootSplashHidden)
}

function markBootSplashHidden() {
  ;(window as BootSplashWindow).__hatrickBootSplashHidden = true
  window.dispatchEvent(new Event(APP_BOOT_SPLASH_HIDDEN_EVENT))
}

export function AppBootSplash({ children }: { children: ReactNode }) {
  const authLoading = use_auth_store((state) => state.is_loading)
  const isAuthenticated = use_auth_store((state) => state.is_authenticated)
  const userId = use_auth_store((state) => state.user?.user_id)
  const isOnline = useNetworkStatus()
  const typedWord = useTypingEffect(WORD, APP_BOOT_TYPING_SPEED_MS)
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [maxElapsed, setMaxElapsed] = useState(false)
  const [cacheReady, setCacheReady] = useState(false)
  const [mounted, setMounted] = useState(() => !hasBootSplashAlreadyHidden())
  const bootReady = !authLoading && (!isAuthenticated || cacheReady)
  const exiting = minimumElapsed && (bootReady || maxElapsed)

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => setMinimumElapsed(true), MIN_VISIBLE_MS)
    const maxTimer = window.setTimeout(() => setMaxElapsed(true), MAX_BOOT_WAIT_MS)

    return () => {
      window.clearTimeout(minimumTimer)
      window.clearTimeout(maxTimer)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    let readyTimer: number | null = null

    if (!isAuthenticated || !isOnline) {
      readyTimer = window.setTimeout(() => {
        if (!cancelled) setCacheReady(true)
      }, 0)
      return () => {
        cancelled = true
        if (readyTimer !== null) window.clearTimeout(readyTimer)
      }
    }

    readyTimer = window.setTimeout(() => {
      if (!cancelled) setCacheReady(false)
    }, 0)
    warm_authenticated_app_cache()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCacheReady(true)
      })

    return () => {
      cancelled = true
      if (readyTimer !== null) window.clearTimeout(readyTimer)
    }
  }, [authLoading, isAuthenticated, isOnline, userId])

  useEffect(() => {
    if (!mounted || !exiting) return

    const exitTimer = window.setTimeout(() => {
      setMounted(false)
      markBootSplashHidden()
    }, EXIT_MS)
    return () => window.clearTimeout(exitTimer)
  }, [exiting, mounted])

  return (
    <>
      {children}
      {mounted ? (
        <AppBootSplashFrame typedWord={typedWord} exiting={exiting} />
      ) : null}
    </>
  )
}

export function AppBootSplashFrame({
  typedWord,
  exiting = false,
}: {
  typedWord: string
  exiting?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-[9999] flex min-h-dvh flex-col items-center justify-center bg-background transition-opacity duration-200',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
    >
      <img
        src={logo}
        alt=""
        className="h-36 w-36 animate-boot-logo object-contain sm:h-40 sm:w-40"
        draggable={false}
      />
      <div className="mt-6 min-h-9 text-3xl font-medium tracking-tight text-foreground">
        {typedWord}
      </div>
    </div>
  )
}
