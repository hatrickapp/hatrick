import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CalendarX2, CheckCircle2, LockKeyhole } from 'lucide-react'
import { ErrorAlert } from '@/components/shared/error_alert'
import { MatchesSkeleton } from '@/components/shared/dashboard_skeletons'
import { DateSlider } from '@/components/shared/date_slider'
import { MatchTeamsRow } from '@/components/shared/match_teams_row'
import { load_profile } from '@/controllers/dashboard_controller'
import { HATRICK_CACHE_UPDATED_EVENT } from '@/controllers/cache_orchestrator'
import { get_cached_matches, load_match_detail, load_matches, prefetch_match_days } from '@/controllers/sports_controller'
import { competition_logo_image_class } from '@/lib/competition_logo'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { CompetitionItem, MatchListItem } from '@/types/sports_types'

const finishedStatuses = new Set(['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'])
const liveScoreStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])

function format_time(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(value))
}

function format_day(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(value))
}

function local_day_key(value: string | Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(value instanceof Date ? value : new Date(value))

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '00'
  const day = parts.find((part) => part.type === 'day')?.value ?? '00'
  return `${year}-${month}-${day}`
}

function day_heading(value: string, timezone: string): string {
  const matchDay = local_day_key(value, timezone)
  const today = local_day_key(new Date(), timezone)
  if (matchDay === today) return 'Today'
  return format_day(value, timezone)
}

function selected_day_label(value: string, timezone: string): string {
  const date = new Date(`${value}T12:00:00`)
  const today = local_day_key(new Date(), timezone)
  const yesterday = local_day_key(new Date(Date.now() - 24 * 60 * 60 * 1000), timezone)
  if (value === today) return 'Today'
  if (value === yesterday) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(date)
}

function no_matches_title(label: string): string {
  if (label === 'Today' || label === 'Yesterday') return `No matches ${label.toLowerCase()}.`
  return `No matches on ${label}.`
}

function competition_logo(src: string | null, name: string) {
  if (!src) return <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10" />
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
      <img src={src} alt={name} className={cn('h-6 w-6 object-contain', competition_logo_image_class(name))} loading="lazy" />
    </span>
  )
}

function score_or_time(match: MatchListItem, timezone: string) {
  const displayHomeScore = ['AET', 'PEN'].includes(match.status) ? match.final_home_score ?? match.home_score : match.home_score
  const displayAwayScore = ['AET', 'PEN'].includes(match.status) ? match.final_away_score ?? match.away_score : match.away_score
  if (displayHomeScore !== null && displayAwayScore !== null) {
    return <span className={cn('tabular-nums', liveScoreStatuses.has(match.status) && 'text-destructive')}>{displayHomeScore} - {displayAwayScore}</span>
  }
  return <span className="text-muted-foreground">{format_time(match.kickoff_at, timezone)}</span>
}

function compare_kickoff_asc(left: MatchListItem, right: MatchListItem): number {
  return new Date(left.kickoff_at).getTime() - new Date(right.kickoff_at).getTime()
}

function group_matches_by_day_and_competition(matches: MatchListItem[], timezone: string) {
  const dayGroups = new Map<string, { day: string; firstKickoff: string; competitions: Map<string, { competition: CompetitionItem; rows: MatchListItem[] }> }>()
  const sortedMatches = [...matches].sort(compare_kickoff_asc)

  for (const match of sortedMatches) {
    const dayKey = local_day_key(match.kickoff_at, timezone)
    const dayGroup = dayGroups.get(dayKey) ?? {
      day: day_heading(match.kickoff_at, timezone),
      firstKickoff: match.kickoff_at,
      competitions: new Map<string, { competition: CompetitionItem; rows: MatchListItem[] }>(),
    }
    const competitionGroup = dayGroup.competitions.get(match.competition.competition_id) ?? {
      competition: match.competition,
      rows: [],
    }
    competitionGroup.rows.push(match)
    dayGroup.competitions.set(match.competition.competition_id, competitionGroup)
    dayGroups.set(dayKey, dayGroup)
  }

  return Array.from(dayGroups.values()).map((dayGroup) => ({
    day: dayGroup.day,
    firstKickoff: dayGroup.firstKickoff,
    competitions: Array.from(dayGroup.competitions.values()).sort((left, right) => {
      const sortOrder = left.competition.sort_order - right.competition.sort_order
      if (sortOrder !== 0) return sortOrder
      return left.competition.name.localeCompare(right.competition.name)
    }).map((group) => ({
      ...group,
      rows: [...group.rows].sort(compare_kickoff_asc),
    })),
  }))
}

export function MatchesPage() {
  const profile = use_dashboard_store((s) => s.profile)
  const timezone = profile?.timezone ?? 'UTC'
  const todayDate = local_day_key(new Date(), timezone)
  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null)
  const selectedDate = selectedDateOverride ?? todayDate
  const selectedLabel = selected_day_label(selectedDate, timezone)
  const isToday = selectedDate === todayDate
  const [matches, setMatches] = useState<MatchListItem[]>(() => get_cached_matches('today', undefined, selectedDate) ?? [])
  const [loading, setLoading] = useState(() => !get_cached_matches('today', undefined, selectedDate))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) load_profile().catch(() => undefined)
  }, [profile])

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const load = () => {
      const cached = get_cached_matches('today', undefined, selectedDate)
      if (cached) setMatches(cached)
      setLoading(!cached)
      load_matches('today', undefined, isToday, selectedDate)
        .then((matchRows) => {
          if (cancelled) return
          setMatches(matchRows)
          setError(null)
          prefetch_match_days(selectedDate).catch(() => undefined)
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load matches.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isToday, profile, selectedDate])

  useEffect(() => {
    const syncFromCache = () => {
      const cachedMatches = get_cached_matches('today', undefined, selectedDate)
      if (cachedMatches) setMatches(cachedMatches)
    }
    window.addEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
  }, [selectedDate])

  const grouped = group_matches_by_day_and_competition(matches, timezone)
  const hasNoMatchesLeft = isToday && matches.length > 0 && matches.every((match) => finishedStatuses.has(match.status))

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-background">
      <div className="mx-auto flex w-full flex-col gap-8 px-4 pb-8 pt-5 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              {isToday ? "Today's Matches" : `${selectedLabel} Matches`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground/60">Pick the outcome, BTTS, and scorer before each match starts.</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="min-w-0 overflow-visible pb-10">
            <DateSlider
              selectedDate={selectedDate}
              timezone={timezone}
              daysBack={365}
              onDateChange={(value) => setSelectedDateOverride(value)}
            />
            {loading ? (
              <MatchesSkeleton />
            ) : error ? (
              <div className="border-y border-border/40 py-10">
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              </div>
            ) : grouped.length === 0 ? (
              <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 py-8 text-center">
                <CalendarDays className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">{no_matches_title(selectedLabel)}</p>
                <p className="max-w-sm text-xs leading-5 text-muted-foreground/60">
                  {isToday
                    ? 'The pitch is quiet today. Check another date or come back for the next slate.'
                    : 'No fixtures were available for this date. Use the date slider to review another matchday.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {grouped.map((dayGroup) => (
                  <section key={dayGroup.firstKickoff} className="space-y-6">
                    {dayGroup.competitions.map((group) => (
                      <section key={`${dayGroup.day}-${group.competition.competition_id}`} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {competition_logo(group.competition.logo_url, group.competition.name)}
                            <h2 className="text-base font-medium">{group.competition.name}</h2>
                          </div>
                        </div>
                        <div className="divide-y divide-border/30">
                          {group.rows.map((match) => (
                            <Link
                              key={match.match_id}
                              to={ROUTES.DASHBOARD_MATCH_DETAIL.replace(':match_id', match.match_id)}
                              onClick={() => {
                                load_match_detail(match.match_id, true).catch(() => undefined)
                              }}
                              className="flex w-full items-center gap-2 px-1 py-3.5 transition-colors sm:gap-3 sm:px-4 sm:py-5"
                            >
                              <MatchTeamsRow match={match} center={score_or_time(match, timezone)} />
                              <div className="hidden w-28 shrink-0 items-center justify-end gap-2 lg:flex">
                                {match.user_prediction && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                {match.is_locked && <LockKeyhole className="h-4 w-4 text-muted-foreground" />}
                                <span className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">{match.status}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </section>
                ))}
                {hasNoMatchesLeft && (
                  <div className="border-t border-border/40 pt-10">
                    <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-start gap-3 px-3 sm:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)_112px] sm:px-4">
                      <div className="col-span-3 flex w-full max-w-[260px] flex-col items-center gap-3 justify-self-center text-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                          <CalendarX2 className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">No matches left today.</p>
                        <p className="text-xs leading-5 text-muted-foreground/60">Today's fixtures are finished. Come back for the next slate and another chance to climb.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
