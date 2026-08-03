import { useEffect, useRef } from 'react'
import { DoorOpen, ListFilter, Plus, Settings, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { cn } from '@/lib/utils'
import type { LeagueStandingItem, LeagueSummaryItem } from '@/types/league_types'
import { format_date_range, league_status_label } from './league_helpers'
import { LeagueDetail } from './league_detail'

type LeagueTab = 'created' | 'joined' | 'finished'

export function MyLeagues({
  createdLeagues,
  joinedLeagues,
  finishedLeagues,
  activeId,
  selectedLeague,
  standings,
  loadingStandings,
  leavingLeagueId,
  removingUserId,
  tab,
  onTabChange,
  onCreate,
  onToggleJoin,
  onSelect,
  onSettings,
  onLeave,
  onRemoveMember,
}: {
  createdLeagues: LeagueSummaryItem[]
  joinedLeagues: LeagueSummaryItem[]
  finishedLeagues: LeagueSummaryItem[]
  activeId?: string | null
  selectedLeague: LeagueSummaryItem | null
  standings: LeagueStandingItem[]
  loadingStandings: boolean
  leavingLeagueId?: string | null
  removingUserId?: string | null
  tab: LeagueTab
  onTabChange: (tab: LeagueTab) => void
  onCreate: () => void
  onToggleJoin: () => void
  onSelect: (league: LeagueSummaryItem) => void
  onSettings: (league: LeagueSummaryItem) => void
  onLeave: (league: LeagueSummaryItem) => void
  onRemoveMember: (userId: string) => void
}) {
  const detailRef = useRef<HTMLDivElement | null>(null)
  const leagues = tab === 'created' ? createdLeagues : tab === 'joined' ? joinedLeagues : finishedLeagues
  const title = tab === 'created' ? 'Created Leagues' : tab === 'joined' ? 'Joined Leagues' : 'Finished Leagues'
  const nextTab = tab === 'created' ? 'joined' : tab === 'joined' ? 'finished' : 'created'
  const nextLabel = nextTab === 'created' ? 'created leagues' : nextTab === 'joined' ? 'joined leagues' : 'finished leagues'
  const emptyCopy = tab === 'created'
    ? 'Create a league when you are ready to host your own table.'
    : tab === 'joined'
      ? 'Accepted invitations will show here once you join.'
      : 'Completed leagues will stay here once they finish.'

  useEffect(() => {
    if (!activeId) return
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [activeId, selectedLeague?.league_id])

  return (
    <section className="pb-6">
      <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={onCreate}
              aria-label="Create league"
              className="h-10 px-5 shadow-[1.5px_1.5px_0_#000]"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onToggleJoin}
              className={cn(
                'h-10 px-5 text-foreground shadow-[1.5px_1.5px_0_#000]',
                'border-primary bg-primary/5 text-primary'
              )}
            >
              Join
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onTabChange(nextTab)}
              aria-label={`Show ${nextLabel}`}
              title={`Show ${nextLabel}`}
              className="h-10 w-10 text-muted-foreground shadow-none"
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
      </div>
      {leagues.length === 0 ? (
        <div className="mt-6 flex min-h-[42vh] flex-col items-center justify-center py-8 text-center">
          <UsersRound className="h-6 w-6 text-primary" />
          <p className="mt-4 text-sm font-medium">No leagues here yet.</p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground/60">{emptyCopy}</p>
        </div>
      ) : (
        <div className="mt-6">
          {leagues.map((league) => (
            <div key={league.league_id} className="border-t border-border/30">
              <div
                className={cn(
                  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 pb-4 pt-3 transition-colors ',
                  activeId === league.league_id && 'text-primary'
                )}
              >
                <Button type="button" variant="ghost" onClick={() => onSelect(league)} className="h-auto w-full min-w-0 flex-col items-start justify-start gap-0 overflow-hidden whitespace-normal rounded-none p-0 text-left shadow-none ">
                  <p className="w-full truncate text-base font-medium tracking-tight">{league.name}</p>
                  <p className="mt-1 w-full truncate text-xs text-muted-foreground/60">
                    {league_status_label(league.status)} · {league.member_count} / {league.max_members} players · {format_date_range(league.starts_at, league.ends_at)}
                  </p>
                </Button>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-xs text-muted-foreground/60">{league.user_rank ? `#${league.user_rank}` : 'Open'}</p>
                  {league.is_host && (
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="League settings"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSettings(league)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground shadow-none  "
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  {!league.is_host && league.status !== 'finished' && (
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Leave league"
                      disabled={leavingLeagueId === league.league_id}
                      onClick={(event) => {
                        event.stopPropagation()
                        onLeave(league)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground shadow-none   disabled:pointer-events-none disabled:opacity-50"
                    >
                      {leavingLeagueId === league.league_id ? <LoadingSpinner size="sm" /> : <DoorOpen className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
              {activeId === league.league_id && selectedLeague && (
                <div ref={detailRef} className="scroll-mt-24">
                  <LeagueDetail
                    league={selectedLeague}
                    standings={standings}
                    loadingStandings={loadingStandings}
                    removingUserId={removingUserId}
                    onRemoveMember={onRemoveMember}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
