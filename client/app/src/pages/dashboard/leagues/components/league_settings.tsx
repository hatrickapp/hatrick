import { useEffect, useState } from 'react'
import { Check, LockKeyhole, Pause, Play, Search, Trash2, UserPlus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import * as users_api from '@/api/users_api'
import { invite_user_to_hatrick_league, update_hatrick_league } from '@/controllers/leagues_controller'
import type { LeagueLimitItem, LeagueSummaryItem } from '@/types/league_types'
import type { PublicUserSearchItem } from '@/types/user_types'
import { DateTimeField } from './date_time_field'
import { add_days, date_to_input, league_status_label, start_of_day } from './league_helpers'

type LeagueSettingsAction = 'end_date' | 'active' | 'paused' | 'closed' | 'deleted'

function clean_user_query(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

export function LeagueSettings({
  league,
  leagueLimits,
  onUpdated,
}: {
  league: LeagueSummaryItem
  leagueLimits: LeagueLimitItem
  onUpdated: (league: LeagueSummaryItem) => void
}) {
  const [endsAt, setEndsAt] = useState(() => date_to_input(new Date(league.ends_at)))
  const [error, setError] = useState<string | null>(null)
  const [inviteQuery, setInviteQuery] = useState('')
  const [inviteResults, setInviteResults] = useState<PublicUserSearchItem[]>([])
  const [inviteResultsOpen, setInviteResultsOpen] = useState(false)
  const [selectedInvitee, setSelectedInvitee] = useState<PublicUserSearchItem | null>(null)
  const [searchingInvitees, setSearchingInvitees] = useState(false)
  const [invitingUser, setInvitingUser] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [savedEndDate, setSavedEndDate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingAction, setSubmittingAction] = useState<LeagueSettingsAction | null>(null)
  const endMinDate = add_days(start_of_day(new Date()), 1)
  const endMaxDate = add_days(start_of_day(new Date()), leagueLimits.max_period_days)

  useEffect(() => {
    setEndsAt(date_to_input(new Date(league.ends_at)))
  }, [league.ends_at])

  useEffect(() => {
    if (inviteQuery.length < 2 || selectedInvitee) {
      setInviteResults([])
      setInviteResultsOpen(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      setSearchingInvitees(true)
      users_api.search_users(inviteQuery, null, controller.signal)
        .then((response) => {
          setInviteResults(response.users.filter((user) => user.user_id !== league.host_user_id))
          setInviteResultsOpen(true)
        })
        .catch(() => undefined)
        .finally(() => setSearchingInvitees(false))
    }, 220)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [inviteQuery, league.host_user_id, selectedInvitee])

  useEffect(() => {
    if (!savedEndDate) return
    const timeout = window.setTimeout(() => setSavedEndDate(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [savedEndDate])

  useEffect(() => {
    if (endsAt !== date_to_input(new Date(league.ends_at))) setSavedEndDate(false)
  }, [endsAt, league.ends_at])

  async function sendInvitation() {
    if (!selectedInvitee || invitingUser) return
    setInvitingUser(true)
    setError(null)
    try {
      await invite_user_to_hatrick_league(league.league_id, selectedInvitee.user_id)
      setInviteSent(true)
      window.setTimeout(() => setInviteSent(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invitation.')
    } finally {
      setInvitingUser(false)
    }
  }

  async function update(body: Parameters<typeof update_hatrick_league>[1], action: LeagueSettingsAction) {
    setSubmitting(true)
    setSubmittingAction(action)
    setError(null)
    try {
      const response = await update_hatrick_league(league.league_id, body)
      onUpdated(response.league)
      if (action === 'end_date') setSavedEndDate(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update league.')
    } finally {
      setSubmitting(false)
      setSubmittingAction(null)
    }
  }

  return (
    <section className="pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6 sm:pb-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Invite User</p>
        <div className="mt-2 max-w-xl">
          {selectedInvitee ? (
            <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-input bg-input-background px-2.5 shadow-[1.5px_1.5px_0_#000]">
              <div className="min-w-0 flex-1 leading-none">
                <p className="truncate text-sm font-medium leading-5">@{selectedInvitee.username}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Change selected user"
                onClick={() => {
                  setSelectedInvitee(null)
                  setInviteQuery('')
                  setInviteSent(false)
                }}
                className="h-8 w-8 shrink-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  value={inviteQuery}
                  onChange={(event) => {
                    setInviteQuery(clean_user_query(event.target.value))
                    setInviteResultsOpen(false)
                  }}
                  onFocus={() => {
                    if (inviteQuery.length >= 2 && inviteResults.length > 0) setInviteResultsOpen(true)
                  }}
                  placeholder="Search username"
                  className="h-10 bg-input-background pl-9 text-foreground"
                />
              </div>
              {inviteResultsOpen && inviteQuery.length >= 2 && (
                <div className="mt-2 border-y border-border/30 bg-background py-2">
                  {inviteResults.length === 0 && !searchingInvitees ? (
                    <p className="px-3 py-4 text-center text-xs font-medium text-muted-foreground/60">No users found</p>
                  ) : (
                    inviteResults.map((user) => (
                      <Button
                        key={user.user_id}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedInvitee(user)
                          setInviteQuery(user.username)
                          setInviteResults([])
                          setInviteResultsOpen(false)
                          setInviteSent(false)
                        }}
                        className="flex h-auto w-full justify-start gap-3 rounded-none px-3 py-2 text-left shadow-none"
                      >
                        <PlusAvatarRing active={user.plan === 'plus'}>
                          <Avatar className="h-8 w-8 border border-border/40">
                            <AvatarFallback><AvatarPlaceholder /></AvatarFallback>
                          </Avatar>
                        </PlusAvatarRing>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">@{user.username}</p>
                          {user.name && <p className="truncate text-xs text-muted-foreground/60">{user.name}</p>}
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <Button type="button" disabled={!selectedInvitee || invitingUser} onClick={sendInvitation} className="mt-4 min-w-32">
            {invitingUser ? <LoadingSpinner size="sm" className="mr-2" /> : inviteSent ? <Check className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {invitingUser ? 'Inviting' : inviteSent ? 'Invited' : 'Invite'}
          </Button>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Sending again replaces any pending invite for this league.</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div className="border-t border-border/30 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">End Date</p>
          <div className="mt-2 max-w-xl">
            <DateTimeField
              label="League closes"
              description="Must be at least tomorrow."
              value={endsAt}
              onChange={setEndsAt}
              minDate={endMinDate}
              maxDate={endMaxDate}
            />
          </div>
          <Button disabled={submitting || endsAt === date_to_input(new Date(league.ends_at))} onClick={() => update({ ends_at: new Date(endsAt).toISOString() }, 'end_date')} className="mt-5 min-w-32">
            {submittingAction === 'end_date' && <LoadingSpinner size="sm" className="mr-2" />}
            {savedEndDate && submittingAction !== 'end_date' && <Check className="mr-2 h-4 w-4" />}
            {submittingAction === 'end_date' ? 'Saving' : savedEndDate ? 'Saved' : 'Save End Date'}
          </Button>
        </div>

        <div className="border-t border-border/30 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">League State</p>
          <div className="mt-2 max-w-xl">
            <p className="text-sm font-medium tracking-tight">{league_status_label(league.status)}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Pause to stop new joins and scoring changes. Close when the league should stop permanently.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {league.status !== 'active' && (
                <Button variant="ghost" size="sm" disabled={submitting} onClick={() => update({ status: 'active' }, 'active')} className={submittingAction === 'active' ? 'text-primary' : ''}>
                  {submittingAction === 'active' ? <LoadingSpinner size="sm" className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}
                  {submittingAction === 'active' ? 'Resuming' : 'Resume'}
                </Button>
              )}
              {league.status === 'active' && (
                <Button variant="ghost" size="sm" disabled={submitting} onClick={() => update({ status: 'paused' }, 'paused')} className={submittingAction === 'paused' ? 'text-primary' : ''}>
                  {submittingAction === 'paused' ? <LoadingSpinner size="sm" className="mr-2" /> : <Pause className="mr-2 h-4 w-4" />}
                  {submittingAction === 'paused' ? 'Pausing' : 'Pause'}
                </Button>
              )}
              {league.status !== 'closed' && (
                <Button variant="ghost" size="sm" disabled={submitting} onClick={() => update({ status: 'closed' }, 'closed')} className={submittingAction === 'closed' ? 'text-primary' : ''}>
                  {submittingAction === 'closed' ? <LoadingSpinner size="sm" className="mr-2" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                  {submittingAction === 'closed' ? 'Closing' : 'Close'}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-border/30 pt-5">
            <p className="text-sm font-medium tracking-tight">Remove league</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Finished leagues stay in history. Active leagues can be removed by the host.</p>
            <Button variant="outline" size="sm" disabled={submitting || league.status === 'finished'} onClick={() => update({ status: 'deleted' }, 'deleted')} className="mt-3 shadow-[1.5px_1.5px_0_#000] text-destructive ">
              {submittingAction === 'deleted' ? <LoadingSpinner size="sm" className="mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {submittingAction === 'deleted' ? 'Deleting' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
      <ErrorAlert message={error} onDismiss={() => setError(null)} />
    </section>
  )
}
