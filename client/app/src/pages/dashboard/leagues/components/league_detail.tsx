import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DoorOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SettingsListSkeleton } from '@/components/shared/dashboard_skeletons'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { cn } from '@/lib/utils'
import type { LeagueStandingItem, LeagueSummaryItem } from '@/types/league_types'
import { competition_logo, scoring_label } from './league_helpers'

export function LeagueDetail({
  league,
  standings,
  loadingStandings,
  removingUserId,
  onRemoveMember,
}: {
  league: LeagueSummaryItem
  standings: LeagueStandingItem[]
  loadingStandings: boolean
  removingUserId?: string | null
  onRemoveMember?: (userId: string) => void
}) {
  const [showAllCompetitions, setShowAllCompetitions] = useState(false)
  const hasMoreCompetitions = league.competitions.length > 7
  const canRemoveMembers = league.is_host && league.status !== 'finished' && league.member_count > 1

  return (
    <section className="border-t border-border/30 py-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">How to Score</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Points count for all {scoring_label(league.scoring)}
        </p>
      </div>

      <div className="mt-6 border-b border-border/30 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">League Competitions</p>
        <div className={cn(
          'mt-3 flex flex-wrap items-center gap-x-5 gap-y-3',
          hasMoreCompetitions && !showAllCompetitions && 'sm:max-h-7 sm:overflow-hidden'
        )}>
          {league.competitions.map((competition) => (
            <span key={competition.competition_id} className="inline-flex items-center gap-2 text-sm font-medium" title={competition.name}>
              {competition_logo(competition.logo_url, competition.name)}
              <span className="hidden sm:inline">{competition.name}</span>
            </span>
          ))}
        </div>
        {hasMoreCompetitions && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAllCompetitions((value) => !value)}
            className="mt-2 hidden h-auto p-0 text-xs font-semibold text-primary shadow-none   sm:inline-flex"
          >
            {showAllCompetitions ? 'Less' : 'More'}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Standings</p>
        {loadingStandings ? (
          <SettingsListSkeleton />
        ) : standings.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Standings appear after players join.</p>
        ) : (
          <div className="mt-4 divide-y divide-border/30">
            {standings.map((row) => (
              <div
                key={row.user_id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-3 sm:gap-3 sm:py-4"
              >
                <Link
                  to={`/dashboard/users/${encodeURIComponent(row.username)}`}
                  className="grid min-w-0 grid-cols-[32px_minmax(0,1fr)_52px] items-center gap-2 transition-colors  sm:grid-cols-[48px_minmax(0,1fr)_80px] sm:gap-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground sm:text-sm">#{row.rank}</p>
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Avatar className="h-8 w-8 border border-border/40 sm:h-9 sm:w-9">
                      <AvatarFallback><AvatarPlaceholder /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-medium tracking-tight">
                        <span className="truncate">@{row.username}</span>
                      </p>
                      {row.name && <p className="truncate text-xs text-muted-foreground/60">{row.name}</p>}
                    </div>
                  </div>
                  <p className="text-right text-base font-semibold text-primary sm:text-lg">{row.points}</p>
                </Link>
                {canRemoveMembers && !row.is_current_user && onRemoveMember && (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Remove ${row.username} from league`}
                    disabled={removingUserId === row.user_id}
                    onClick={() => onRemoveMember(row.user_id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground shadow-none   disabled:pointer-events-none disabled:opacity-50"
                  >
                    {removingUserId === row.user_id ? <LoadingSpinner size="sm" /> : <DoorOpen className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
