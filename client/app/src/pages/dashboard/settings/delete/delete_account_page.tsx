import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriangleAlert, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { handle_account_delete_initiate } from '@/controllers/dashboard_controller'
import { ROUTES } from '@/lib/constants'
import type { OtpRouterState } from '@/types/auth_types'

export function DeleteAccountPage() {
  const navigate = useNavigate()
  const [loading, set_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)
  const [confirming, set_confirming] = useState(false)

  const handle_click = async () => {
    if (!confirming) {
      set_confirming(true)
      setTimeout(() => {
        set_confirming(false)
      }, 4000)
      return
    }

    set_error(null)
    set_loading(true)
    try {
      await handle_account_delete_initiate()
      const state: OtpRouterState = { context: 'account_delete' }
      navigate(ROUTES.OTP, { state })
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Something went wrong.')
      set_confirming(false)
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="max-w-sm space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 text-destructive/80">
            <TriangleAlert className="h-4 w-4" />
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest">Danger Zone</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">
              Once you delete your account, there is no going back.
            </p>

            <ul className="space-y-3">
              {[
                "Permanent deletion of all data",
                "Deletion of your rankings and hosted leagues",
                "Termination of active sessions",
                "Removal of authorizations",
                "Irreversible action"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground/60">
                  <div className="h-1 w-1 rounded-full bg-destructive/30" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <ErrorAlert message={error} onDismiss={() => set_error(null)} />

          <Button
            type="button"
            variant="destructive"
            onClick={handle_click}
            disabled={loading}
            className="relative w-full h-10 overflow-hidden font-medium transition-all duration-300 active:scale-[0.99]"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="relative h-full w-full flex items-center justify-center">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    confirming ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete my account
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center font-semibold transition-all duration-300 ${
                    confirming ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  Are you absolutely sure?
                </span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
