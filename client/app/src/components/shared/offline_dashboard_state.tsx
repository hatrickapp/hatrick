import { useState } from 'react'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { requestNetworkStatusRecheck } from '@/hooks/use_network_status'

type OfflineDashboardStateProps = {
  onRetryOnline?: () => Promise<void> | void
}

export function OfflineDashboardState({ onRetryOnline }: OfflineDashboardStateProps) {
  const [checking, setChecking] = useState(false)

  async function retry_connection() {
    if (checking) return

    setChecking(true)
    try {
      await requestNetworkStatusRecheck()
      await onRetryOnline?.()
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-[42vh] flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <WifiOff className="h-7 w-7 text-primary" />
      <p className="mt-4 text-sm font-medium text-foreground">You are offline</p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground/60">
        Connect to the internet to load today&apos;s matches, predictions, leagues, and profile updates.
      </p>
      {checking ? (
        <div className="mt-5 flex flex-col items-center gap-2" aria-label="Checking connection">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-5 h-auto px-0 py-0 text-sm font-medium text-primary shadow-none  "
          onClick={retry_connection}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
