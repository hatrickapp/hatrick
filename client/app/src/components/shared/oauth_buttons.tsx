import { useMemo, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { get_post_auth_redirect_path, handle_apple_native_sign_in, handle_google_native_sign_in } from '@/controllers/auth_controller'
import appleLogo from '@/assets/apple.png'
import { ErrorAlert } from './error_alert'
import { LoadingSpinner } from './loading_spinner'

function AppleIcon() {
  return (
    <img
      src={appleLogo}
      alt=""
      aria-hidden="true"
      className="h-4 w-4 shrink-0 object-contain"
      draggable={false}
    />
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#3F9B0B"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

type OAuthProvider = 'apple' | 'google'

function OAuthButton({ provider }: { provider: OAuthProvider }) {
  const navigate = useNavigate()
  const [loading, set_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)
  const isApple = provider === 'apple'

  const handle_click = async () => {
    set_loading(true)
    set_error(null)
    try {
      const user = isApple
        ? await handle_apple_native_sign_in()
        : await handle_google_native_sign_in()
      navigate(await get_post_auth_redirect_path(user?.role), { replace: true })
    } catch (err) {
      console.error(`${isApple ? 'Apple' : 'Google'} sign-in failed`, err)
      set_error(err instanceof Error ? err.message : 'Could not complete sign-in.')
      set_loading(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full justify-center rounded-lg border-border/80 bg-background text-base font-medium text-foreground shadow-[1.5px_1.5px_0_#000] lg:h-14 lg:text-lg"
        onClick={handle_click}
        disabled={loading}
      >
        <span className="grid w-[210px] grid-cols-[20px_1fr] items-center gap-3 lg:w-[250px] lg:grid-cols-[24px_1fr]">
          <span className="flex h-5 w-5 items-center justify-center lg:h-6 lg:w-6">
            {loading ? <LoadingSpinner size="sm" /> : isApple ? <AppleIcon /> : <GoogleIcon />}
          </span>
          <span className="text-left">Continue with {isApple ? 'Apple' : 'Google'}</span>
        </span>
      </Button>
      <ErrorAlert message={error} onDismiss={() => set_error(null)} />
    </div>
  )
}

function ordered_providers(): OAuthProvider[] {
  return Capacitor.getPlatform() === 'ios'
    ? ['apple', 'google']
    : ['google']
}

export function OAuthButtons() {
  const providers = useMemo(() => ordered_providers(), [])

  return (
    <div className="grid gap-3">
      {providers.map((provider) => <OAuthButton key={provider} provider={provider} />)}
    </div>
  )
}
