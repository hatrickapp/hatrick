import { useEffect, useState } from 'react'
import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BillingSettingsSkeleton } from '@/components/shared/dashboard_skeletons'
import { Button } from '@/components/ui/button'
import { handle_restore_purchases, handle_revenuecat_management_url, load_billing_status } from '@/controllers/billing_controller'
import { ROUTES } from '@/lib/constants'
import { use_auth_store } from '@/store/auth_store'
import { use_dashboard_store } from '@/store/dashboard_store'

export function BillingSettingsPage() {
  const user = use_auth_store((state) => state.user)
  const profile = use_dashboard_store((state) => state.profile)
  const status = use_dashboard_store((state) => state.billing_status)
  const [loadingStatus, setLoadingStatus] = useState(!status)
  const [loadingRestore, setLoadingRestore] = useState(false)
  const [loadingManage, setLoadingManage] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [managementUrl, setManagementUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.user_id) {
      setLoadingStatus(false)
      return
    }
    let cancelled = false
    setLoadingStatus(!status)
    load_billing_status()
      .catch(() => {
        return undefined
      })
      .finally(() => {
        if (!cancelled) setLoadingStatus(false)
      })
    return () => {
      cancelled = true
    }
  }, [status, user?.user_id])

  const restore = async () => {
    if (!user?.user_id) return
    setMessage(null)
    setLoadingRestore(true)
    try {
      const result = await handle_restore_purchases(user.user_id)
      await load_billing_status(true)
      setMessage(result.active ? 'Purchases restored. Plus is active.' : 'No active Plus subscription was found for this store account.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not restore purchases.')
    } finally {
      setLoadingRestore(false)
    }
  }

  const manage = async () => {
    if (!user?.user_id) return
    setMessage(null)
    setLoadingManage(true)
    try {
      const url = managementUrl ?? await handle_revenuecat_management_url(user.user_id)
      setManagementUrl(url)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      else setMessage('No store subscription management link is available for this account.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open subscription management.')
    } finally {
      setLoadingManage(false)
    }
  }

  const active = status?.active ?? profile?.plan === 'plus'
  const hasRestorablePurchase = Boolean(status?.has_restorable_purchase)
  const planLabel = active ? 'Plus' : 'Free'
  const goldButtonClassName = 'h-11 justify-start border-black bg-[#D4AF37] text-foreground hover:bg-[#C9A227] active:bg-[#B89320]'
  const manageButtonClassName = 'h-11 justify-start border-black bg-background text-foreground hover:bg-muted/40 active:bg-muted/60'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {loadingStatus && !status ? (
        <BillingSettingsSkeleton />
      ) : (
        <div className="max-w-sm space-y-5">
          <div className="border-b border-border/30 pb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/40">Current Plan</p>
            <p className={active ? 'mt-2 text-xl font-medium tracking-tight text-[#D4AF37]' : 'mt-2 text-xl font-medium tracking-tight'}>
              {planLabel}
            </p>
          </div>

          <div className="grid gap-3">
            {active ? (
              <Button type="button" onClick={manage} disabled={loadingRestore || loadingManage || loadingStatus} className={manageButtonClassName}>
                <ExternalLink className="size-4" />
                {loadingManage ? 'Opening...' : 'Manage Subscription'}
              </Button>
            ) : hasRestorablePurchase ? (
              <Button type="button" onClick={restore} disabled={loadingRestore || loadingManage || loadingStatus} className={goldButtonClassName}>
                <RefreshCw className="size-4" />
                {loadingRestore ? 'Restoring...' : 'Restore Purchases'}
              </Button>
            ) : (
              <Button asChild className={goldButtonClassName}>
                <Link to={ROUTES.DASHBOARD_UPGRADE}>
                  <Sparkles className="size-4" />
                  Upgrade to Plus
                </Link>
              </Button>
            )}
          </div>

          {message && <p className="text-sm font-medium leading-6 text-foreground">{message}</p>}
          <p className="text-xs leading-5 text-muted-foreground/60">
            Store subscriptions are managed by Apple App Store or Google Play. Restoring re-checks purchases for the signed in Hatrick account.
          </p>
        </div>
      )}
    </div>
  )
}
