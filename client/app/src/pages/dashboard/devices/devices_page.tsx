import { useEffect, useState } from 'react'
import { Smartphone, Trash2, Monitor } from 'lucide-react'
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
import { SettingsListSkeleton } from '@/components/shared/dashboard_skeletons'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { handle_delete_devices, load_devices } from '@/controllers/dashboard_controller'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { UserDeviceItem } from '@/types/authentication_types'

function format_expiry(iso: string | null): string {
  if (!iso) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

interface DeviceRowProps {
  device: UserDeviceItem
  on_delete: (id: string) => Promise<void>
}

function DeviceRow({ device, on_delete }: DeviceRowProps) {
  const [deleting, set_deleting] = useState(false)
  const [error, set_error] = useState<string | null>(null)

  const handle_confirm = async () => {
    set_deleting(true)
    set_error(null)
    try {
      await on_delete(device.device_id)
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Could not revoke this device.')
    } finally {
      set_deleting(false)
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 py-4 group sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        {(() => {
          const name = (device.device_name || '').toLowerCase()
          const Icon = (
            name.includes('iphone') ||
            name.includes('ipad') ||
            name.includes('ios') ||
            name.includes('android') ||
            name.includes('pixel')
          ) ? Smartphone : Monitor
          return <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary transition-colors sm:mt-0" />
        })()}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">{device.device_name || 'Unknown device'}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground/60">
            Expiry: {format_expiry(device.expires_at)}
          </p>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground ">
            {deleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium tracking-tight">Revoke trusted status?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This trusted device will be removed, its active sessions will be ended, and this app will return to sign in.
            </AlertDialogDescription>
            {error ? (
              <p className="text-xs font-medium text-destructive">{error}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handle_confirm()
              }}
              className="bg-destructive text-destructive-foreground  h-8 text-xs font-bold"
            >
              Revoke Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function DevicesPage() {
  const devices = use_dashboard_store((s) => s.devices)
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    load_devices().finally(() => set_loading(false))
  }, [])

  const on_delete = async (device_id: string) => {
    await handle_delete_devices([device_id])
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium tracking-tight">Trusted Devices</h2>
        <p className="text-sm text-muted-foreground/60">Manage devices authorized to bypass two-factor authentication.</p>
      </div>

      <div className="space-y-6 max-w-sm">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/40 border-b border-border/20 pb-3">
          Authorized Devices ({devices.length})
        </h3>
        <div className="divide-y divide-border/30">
          {loading ? (
            <SettingsListSkeleton />
          ) : devices.length === 0 ? (
            <div className="py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <h3 className="font-medium text-sm">No trusted devices</h3>
              <p className="text-xs text-muted-foreground mt-1">Authorized devices will appear here.</p>
            </div>
          ) : (
            devices.map((device) => (
              <DeviceRow key={device.device_id} device={device} on_delete={on_delete} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
