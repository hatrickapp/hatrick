import { useState } from 'react'
import { Ban, Check, Clock, Send, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { SegmentedControl } from '@/components/shared/segmented_control'
import { cn } from '@/lib/utils'
import type { LeagueInvitationItem } from '@/types/league_types'
import { competition_logo, format_date_range, league_status_label, scoring_label } from './league_helpers'

type InvitationStatus = LeagueInvitationItem['status']

function format_sent_at(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function empty_invitation_message(status: InvitationStatus) {
  if (status === 'accepted') {
    return {
      title: 'No accepted invitations.',
      description: 'Accepted league invites will stay here after you join.',
    }
  }
  if (status === 'rejected') {
    return {
      title: 'No rejected invitations.',
      description: 'Invites you decline will appear here for reference.',
    }
  }
  return {
    title: 'No pending invitations.',
    description: 'League invites from hosts will appear here for seven days.',
  }
}

export function LeagueInvitations({
  invitations,
  loading,
  joiningInvitationId,
  rejectingInvitationId,
  error,
  onJoin,
  onReject,
  onClearError,
}: {
  invitations: LeagueInvitationItem[]
  loading: boolean
  joiningInvitationId: string | null
  rejectingInvitationId: string | null
  error: string | null
  onJoin: (invitation: LeagueInvitationItem) => void
  onReject: (invitation: LeagueInvitationItem) => void
  onClearError: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<InvitationStatus>('pending')
  const filteredInvitations = invitations.filter((invitation) => invitation.status === status)
  const selected = filteredInvitations.find((invitation) => invitation.league_invitation_id === selectedId) ?? null
  const emptyMessage = empty_invitation_message(status)

  if (loading) {
    return (
      <section className="py-10 text-center">
        <LoadingSpinner className="mx-auto" />
      </section>
    )
  }

  return (
    <section className="pb-6">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">Invitations</p>
      <SegmentedControl
        value={status}
        onValueChange={setStatus}
        columns={3}
        items={[
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected', tone: 'destructive' },
        ]}
      />
      <div className="mt-4 border-t border-border/30">
        {filteredInvitations.length === 0 && (
          <div className="flex min-h-[32vh] flex-col items-center justify-center py-10 text-center">
            <Send className="h-6 w-6 text-primary" />
            <p className="mt-4 text-sm font-medium">{emptyMessage.title}</p>
            <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground/60">{emptyMessage.description}</p>
          </div>
        )}
        {filteredInvitations.map((invitation) => {
          const active = selected?.league_invitation_id === invitation.league_invitation_id
          const activeTone = invitation.status === 'rejected' ? 'text-destructive' : 'text-primary'
          const timeLabel = invitation.status === 'accepted' ? 'Accepted at' : invitation.status === 'rejected' ? 'Rejected at' : 'Sent'
          const timeValue = invitation.status === 'pending' ? invitation.created_at : (invitation.responded_at ?? invitation.created_at)
          return (
            <div key={invitation.league_invitation_id} className="border-t border-border/30 first:border-t-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedId(active ? null : invitation.league_invitation_id)}
                  className="h-auto min-w-0 rounded-none p-0 text-left shadow-none"
                >
                  <div className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3">
                    <PlusAvatarRing active={invitation.invited_by_plan === 'plus'}>
                      <Avatar className="h-9 w-9 border border-border/40">
                        <AvatarFallback><AvatarPlaceholder /></AvatarFallback>
                      </Avatar>
                    </PlusAvatarRing>
                    <div className="min-w-0 text-left">
                      <p className={cn('truncate text-sm font-medium tracking-tight', active ? activeTone : 'text-foreground')}>@{invitation.invited_by_username}</p>
                      <p className="mt-1 truncate text-xs font-medium text-muted-foreground/70">
                        {invitation.invited_by_name ?? 'Host'} invited you
                      </p>
                    </div>
                  </div>
                </Button>
                {invitation.status === 'pending' ? (
                  <button
                    type="button"
                    disabled={rejectingInvitationId === invitation.league_invitation_id}
                    onClick={() => onReject(invitation)}
                    className="flex h-8 w-8 touch-manipulation items-center justify-center text-destructive disabled:opacity-50"
                    aria-label="Reject invitation"
                  >
                    {rejectingInvitationId === invitation.league_invitation_id ? <LoadingSpinner size="sm" /> : <X className="h-5 w-5" />}
                  </button>
                ) : invitation.status === 'accepted' ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Ban className="h-4 w-4 text-destructive" />
                )}
              </div>

              {active && (
                <div className="pb-5 pt-3">
                  <p className="text-sm leading-6 text-muted-foreground">League name: {invitation.league.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground/60">
                    {league_status_label(invitation.league.status)} · {invitation.league.member_count} / {invitation.league.max_members} players · {format_date_range(invitation.league.starts_at, invitation.league.ends_at)}
                  </p>

                  <div className="mt-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">How to Score</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Points count for all {scoring_label(invitation.league.scoring)}</p>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">League Competitions</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                      {invitation.league.competitions.map((competition) => (
                        <span key={competition.competition_id} title={competition.name} className="inline-flex items-center">
                          {competition_logo(competition.logo_url, competition.name)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <Clock className="h-4 w-4" />
                    <span>{timeLabel} {format_sent_at(timeValue)}</span>
                  </div>

                  {invitation.status === 'pending' && (
                    <Button
                      type="button"
                      disabled={joiningInvitationId === invitation.league_invitation_id}
                      onClick={() => onJoin(invitation)}
                      className="mt-6 h-11 min-w-32"
                    >
                      {joiningInvitationId === invitation.league_invitation_id && <LoadingSpinner size="sm" className="mr-2" />}
                      {joiningInvitationId === invitation.league_invitation_id ? 'Joining' : 'Join'}
                    </Button>
                  )}
                  <ErrorAlert message={error} onDismiss={onClearError} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
