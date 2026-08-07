import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateSlider } from '@/components/shared/date_slider'
import { PredictionsSkeleton } from '@/components/shared/dashboard_skeletons'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { MatchTeamsRow } from '@/components/shared/match_teams_row'
import { load_profile } from '@/controllers/dashboard_controller'
import { HATRICK_CACHE_UPDATED_EVENT } from '@/controllers/cache_orchestrator'
import { get_cached_prediction_history, load_prediction_history, prefetch_prediction_days } from '@/controllers/predictions_controller'
import { competition_logo_image_class } from '@/lib/competition_logo'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { PredictionHistoryItem } from '@/types/prediction_types'
import type { CompetitionItem, MatchListItem } from '@/types/sports_types'

const liveScoreStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])

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

function display_score(match: MatchListItem, timezone: string) {
  const homeScore = ['AET', 'PEN'].includes(match.status) ? match.final_home_score ?? match.home_score : match.home_score
  const awayScore = ['AET', 'PEN'].includes(match.status) ? match.final_away_score ?? match.away_score : match.away_score
  if (homeScore !== null && awayScore !== null) {
    return <span className={cn(liveScoreStatuses.has(match.status) && 'text-destructive')}>{homeScore} - {awayScore}</span>
  }
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(match.kickoff_at))
}

function compare_prediction_kickoff_asc(left: PredictionHistoryItem, right: PredictionHistoryItem): number {
  return new Date(left.match.kickoff_at).getTime() - new Date(right.match.kickoff_at).getTime()
}

function competition_logo(src: string | null, name: string) {
  if (!src) return <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10" />
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
      <img src={src} alt={name} className={cn('h-6 w-6 object-contain', competition_logo_image_class(name))} loading="lazy" />
    </span>
  )
}

function HatrickTips({ className }: { className?: string }) {
  return (
    <aside className={className}>
      <div className="border-y border-border/40 py-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Tips Presented by Hatrick</p>
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm font-medium tracking-tight">Stay objective</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Support your favorite team, but predict with form, injuries, and momentum, not emotion.</p>
          </section>
          <section className="border-t border-border/30 pt-5">
            <h2 className="text-sm font-medium tracking-tight">Check the roster</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A single missing key player can completely change how a match unfolds.</p>
          </section>
        </div>
        <Link to={ROUTES.TERMS_OF_SERVICE} className="mt-7 inline-flex text-sm font-semibold text-primary transition-colors ">
          Read the responsible predictions terms
        </Link>
      </div>
    </aside>
  )
}

function PredictionDetail({ row }: { row: PredictionHistoryItem }) {
  const correctCount = [row.prediction.outcome_correct, row.prediction.btts_correct, row.prediction.scorer_correct].filter(Boolean).length
  const isSettled = row.prediction.status === 'settled'
  const isLive = liveScoreStatuses.has(row.match.status)

  return (
    <div className="border-t border-border/30 px-3 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {isSettled ? `${correctCount} of 3 correct` : isLive ? <>Prediction <span className="text-destructive">Live</span></> : 'Prediction pending'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{row.prediction.status}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-primary">{row.prediction.points} / 60</p>
          <p className="mt-1 text-xs text-muted-foreground">points</p>
        </div>
      </div>
    </div>
  )
}

export function PredictionsPage() {
  const navigate = useNavigate()
  const profile = use_dashboard_store((s) => s.profile)
  const timezone = profile?.timezone ?? 'UTC'
  const todayDate = local_day_key(new Date(), timezone)
  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null)
  const selectedDate = selectedDateOverride ?? todayDate
  const isToday = selectedDate === todayDate
  const cachedHistory = get_cached_prediction_history(null, selectedDate)
  const [rows, setRows] = useState<PredictionHistoryItem[]>(() => cachedHistory?.predictions ?? [])
  const [cursor, setCursor] = useState<string | null>(() => cachedHistory?.next_cursor ?? null)
  const [expandedPredictionId, setExpandedPredictionId] = useState<string | null>(null)
  const expandedPredictionRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(() => !cachedHistory)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load_profile().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!expandedPredictionId) return
    window.requestAnimationFrame(() => {
      expandedPredictionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [expandedPredictionId])

  useEffect(() => {
    let cancelled = false
    const cached = get_cached_prediction_history(null, selectedDate)
    if (cached) {
      setRows(cached.predictions)
      setCursor(cached.next_cursor)
    }
    setLoading(!cached)
    setError(null)
    load_prediction_history(null, isToday, selectedDate)
      .then((response) => {
        if (cancelled) return
        setRows(response.predictions)
        setCursor(response.next_cursor)
        prefetch_prediction_days(selectedDate).catch(() => undefined)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load predictions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isToday, selectedDate])

  useEffect(() => {
    const syncFromCache = () => {
      const cached = get_cached_prediction_history(null, selectedDate)
      if (cached) {
        setRows(cached.predictions)
        setCursor(cached.next_cursor)
      }
    }
    window.addEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
  }, [selectedDate])

  const loadMore = async () => {
    if (!cursor) return
    setLoadingMore(true)
    setError(null)
    try {
      const response = await load_prediction_history(cursor, false, selectedDate)
      setRows((current) => [...current, ...response.predictions])
      setCursor(response.next_cursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more predictions.')
    } finally {
      setLoadingMore(false)
    }
  }

  const sortedRows = useMemo(() => {
    return [...rows].sort(compare_prediction_kickoff_asc)
  }, [rows])

  const groupedRows = useMemo(() => {
    const groups = new Map<string, { competition: CompetitionItem; rows: PredictionHistoryItem[] }>()
    for (const row of sortedRows) {
      const existing = groups.get(row.match.competition.competition_id) ?? {
        competition: row.match.competition,
        rows: [],
      }
      existing.rows.push(row)
      groups.set(row.match.competition.competition_id, existing)
    }
    return Array.from(groups.values()).sort((left, right) => {
      const sortOrder = left.competition.sort_order - right.competition.sort_order
      if (sortOrder !== 0) return sortOrder
      return left.competition.name.localeCompare(right.competition.name)
    }).map((group) => ({
      ...group,
      rows: [...group.rows].sort(compare_prediction_kickoff_asc),
    }))
  }, [sortedRows])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto flex w-full flex-col gap-8 px-4 pb-8 pt-5 sm:px-6 sm:py-8">
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-2xl font-medium tracking-tight">My Predictions</h1>
          <p className="mt-2 text-sm text-muted-foreground/60">Track your picks, points, and Matchweek performance.</p>
        </div>

        <div className="grid gap-8">
          <div className="min-w-0">
            <div className="space-y-4">
              <DateSlider
                selectedDate={selectedDate}
                timezone={timezone}
                daysBack={365}
                onDateChange={(value) => {
                  setSelectedDateOverride(value)
                  setExpandedPredictionId(null)
                }}
              />
              {loading ? (
                <PredictionsSkeleton />
              ) : error ? (
                <div className="border-y border-border/40 py-10">
                  <ErrorAlert message={error} onDismiss={() => setError(null)} />
                </div>
              ) : (
                <div className="space-y-8">
                  {rows.length === 0 ? (
                    <div className="flex min-h-[34vh] flex-col items-center justify-center gap-3 py-8 text-center">
                      <ListChecks className="h-6 w-6 text-primary" />
                      <p className="text-sm font-medium">{isToday ? 'No predictions yet.' : 'No predictions took place on this day.'}</p>
                      <p className="max-w-sm text-xs leading-5 text-muted-foreground/60">
                        {isToday
                          ? 'Make your first picks from the matches page, then come back here to review every choice, score, and result by day.'
                          : 'Use the date slider to review another day, or head to matches when fixtures are available.'}
                      </p>
                      {isToday && <Link to={ROUTES.DASHBOARD_MATCHES} className="text-sm font-medium text-primary ">Go to matches</Link>}
                    </div>
                  ) : groupedRows.map((group) => (
                    <section key={group.competition.competition_id} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {competition_logo(group.competition.logo_url, group.competition.name)}
                          <h2 className="text-base font-medium">{group.competition.name}</h2>
                        </div>
                      </div>
                      <div className="divide-y divide-border/30">
                        {group.rows.map((row) => {
                          const isExpanded = expandedPredictionId === row.prediction.prediction_id
                          const shouldOpenMatchDetail = row.match.status === 'NS' || (!row.match.is_locked && row.prediction.status === 'open')
                          return (
                            <div key={row.prediction.prediction_id}>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  if (shouldOpenMatchDetail) {
                                    navigate(ROUTES.DASHBOARD_MATCH_DETAIL.replace(':match_id', row.match.match_id))
                                    return
                                  }
                                  setExpandedPredictionId(isExpanded ? null : row.prediction.prediction_id)
                                }}
                                className="flex h-auto w-full items-center gap-2 rounded-none px-1 py-3.5 text-left shadow-none sm:gap-3 sm:px-4 sm:py-5"
                              >
                                <MatchTeamsRow match={row.match} center={display_score(row.match, timezone)} />
                              </Button>
                              {isExpanded && (
                                <div ref={expandedPredictionRef} className="scroll-mt-24">
                                  <PredictionDetail row={row} />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
              {cursor && !loading && !error && (
                <div className="flex justify-center">
                  <Button type="button" variant="outline" className="gap-2" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <LoadingSpinner size="sm" /> : <ChevronDown className="h-4 w-4" />}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          </div>
          <HatrickTips className="hidden" />
        </div>
      </div>
    </div>
  )
}
