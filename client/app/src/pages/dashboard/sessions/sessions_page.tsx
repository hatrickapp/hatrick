import { useEffect } from 'react'
import { Globe, Clock, KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SettingsListSkeleton } from '@/components/shared/dashboard_skeletons'
import { load_sessions } from '@/controllers/dashboard_controller'
import { use_dashboard_store } from '@/store/dashboard_store'
import { use_auth_store } from '@/store/auth_store'
import type { UserSessionItem } from '@/types/authentication_types'
import { useState } from 'react'

function format_date(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SessionRow({ session, is_current }: { session: UserSessionItem; is_current: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 text-xs transition-all  group sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/40 border border-border/50  transition-colors">
          <KeyRound className="h-3.5 w-3.5 text-muted-foreground/60  transition-colors" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium tracking-tight text-foreground">Account session</p>
            {is_current && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs font-black uppercase tracking-tighter bg-primary/20 text-primary border-primary/20">
                ACTIVE
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/60 font-medium uppercase tracking-tight">
             <span className="flex items-center gap-1">
               <Globe className="h-2.5 w-2.5" />
               {session.country || 'Global'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
               <Clock className="h-2.5 w-2.5" />
               Log: {format_date(session.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="sm:text-right">
         <p className="text-xs text-muted-foreground/40 font-mono tracking-tighter italic">EXP: {format_date(session.expires_at)}</p>
      </div>
    </div>
  )
}

export function SessionsPage() {
  const sessions = use_dashboard_store((s) => s.sessions)
  const current_user = use_auth_store((s) => s.user)
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    load_sessions().finally(() => set_loading(false))
  }, [])

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
       <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-medium tracking-tight leading-tight text-foreground">Active Sessions</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage your active account connections.</p>
       </div>

       <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-5 py-2.5 border-b border-border/50 text-xs uppercase font-medium tracking-widest text-muted-foreground/60">
             Session Overview ({sessions.length})
          </div>
          <div className="divide-y divide-border/30">
            {loading ? (
               <SettingsListSkeleton />
            ) : sessions.length === 0 ? (
               <div className="py-12 text-center text-xs text-muted-foreground italic">No active sessions detected.</div>
            ) : (
               sessions.map((session) => (
                  <SessionRow
                    key={session.session_id}
                    session={session}
                    is_current={session.session_id === current_user?.session_id}
                  />
               ))
            )}
          </div>
       </div>
    </div>
  )
}
