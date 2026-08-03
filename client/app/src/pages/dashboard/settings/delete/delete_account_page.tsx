import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriangleAlert, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { handle_account_delete_initiate } from '@/controllers/dashboard_controller'
import { ROUTES } from '@/lib/constants'
import type { OtpRouterState } from '@/types/auth_types'

export function DeleteAccountPage() {
  const navigate = useNavigate()
  const [loading, set_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)

  const handle_confirm = async () => {
    set_error(null)
    set_loading(true)
    try {
      await handle_account_delete_initiate()
      const state: OtpRouterState = { context: 'account_delete' }
      navigate(ROUTES.OTP, { state })
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium tracking-tight text-destructive">Delete Account</h2>
        <p className="text-sm text-muted-foreground/60">Permanently remove your account and all associated data.</p>
      </div>
      <div className="border-t border-border/40" />

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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-10 font-medium transition-all" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100vw-2rem)] sm:w-full">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated data.
                  Rankings and leagues you host will be deleted automatically.
                  A verification code will be sent to your email.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handle_confirm}
                  className="bg-destructive text-destructive-foreground "
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
