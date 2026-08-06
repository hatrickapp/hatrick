import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppMark } from '@/components/shared/app_mark'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { handle_account_delete_complete } from '@/controllers/dashboard_controller'
import { ROUTES } from '@/lib/constants'
import type { OtpContext, OtpRouterState } from '@/types/auth_types'

interface OtpConfig {
  title: string
  description: () => string
}

const otp_config: Record<OtpContext, OtpConfig> = {
  account_delete: {
    title: 'Confirm account deletion',
    description: () => 'Enter the 6-digit code to permanently delete your account.',
  },
}

function is_valid_state(state: OtpRouterState): boolean {
  return state.context === 'account_delete'
}

export function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as OtpRouterState | null

  const [otp, set_otp] = useState('')
  const [loading, set_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)
  const is_submitting = useRef(false)

  if (!state || !is_valid_state(state)) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  const { context } = state
  const config = otp_config[context]

  const submit_otp = async (value: string) => {
    if (value.length !== 6 || is_submitting.current) return
    is_submitting.current = true
    set_error(null)
    set_loading(true)

    try {
      await handle_account_delete_complete(value)
      navigate(ROUTES.ACCOUNT_DELETED, { replace: true })
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Invalid code. Please try again.')
      set_otp('')
    } finally {
      set_loading(false)
      is_submitting.current = false
    }
  }

  const handle_otp_change = (value: string) => {
    set_otp(value)
  }

  return (
    <div className="flex flex-col gap-6 -mt-12">
      <div className="flex">
        <BackIconButton to={ROUTES.DASHBOARD_SETTINGS_DELETE} />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-0">
          <AppMark className="h-32" markClassName="h-24 w-24" textClassName="sr-only" />
        </div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">{config.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {config.description()}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit_otp(otp);
        }}
        noValidate
        className="flex flex-col gap-6"
      >
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handle_otp_change}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          variant="destructive"
          className="w-full h-10 font-medium "
          disabled={loading || otp.length < 6}
        >
          {loading ? <LoadingSpinner size="sm" className="mr-2" /> : "Confirm permanent deletion"}
        </Button>

        <ErrorAlert message={error} onDismiss={() => set_error(null)} />

        <p className="text-center text-xs leading-5 text-muted-foreground/60">
          Return to account settings and start deletion again if the code expires.
        </p>
      </form>
    </div>
  )
}
