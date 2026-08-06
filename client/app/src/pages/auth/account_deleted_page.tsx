import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export function AccountDeletedPage() {
  const navigate = useNavigate()

  return (
    <main className="fixed inset-0 z-[60] flex h-svh flex-col overflow-hidden overscroll-none bg-background bg-dot-grid px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] text-foreground animate-upgrade-page-in">
      <div className="mx-auto flex h-full w-full max-w-md flex-col justify-between">
        <div />

        <section className="flex flex-1 flex-col items-center justify-center text-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-5 sm:h-20 sm:w-20">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>

          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Account Deleted
          </h1>

          <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm sm:max-w-sm">
            Your account and associated personal data have been permanently removed. Thank you for being part of Hatrick.
          </p>
        </section>

        <div className="pb-3">
          <Button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
            className="h-11 w-full border-black bg-primary text-primary-foreground shadow-[1.5px_1.5px_0_#000] font-medium sm:h-12"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </main>
  )
}
