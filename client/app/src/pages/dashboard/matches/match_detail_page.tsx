import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MatchDetailSkeleton } from '@/components/shared/dashboard_skeletons'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { load_profile } from '@/controllers/dashboard_controller'
import { HATRICK_CACHE_UPDATED_EVENT } from '@/controllers/cache_orchestrator'
import { save_match_prediction } from '@/controllers/predictions_controller'
import { get_cached_match_detail, load_match_detail } from '@/controllers/sports_controller'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { use_dashboard_store } from '@/store/dashboard_store'
import { use_ui_store } from '@/store/ui_store'
import type { UpsertPredictionRequest } from '@/types/prediction_types'
import type { MatchDetailResponse, MatchGoalItem, PlayerItem } from '@/types/sports_types'

const liveScoreStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])

function format_kickoff(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(value))
}

function team_logo(src: string | null, name: string, className = 'h-12 w-12') {
  if (!src) return <span className={cn('shrink-0 rounded-full bg-primary/10', className)} />
  return <img src={src} alt={name} className={cn('shrink-0 object-contain', className)} loading="lazy" />
}

function player_label(player: PlayerItem): string {
  return player.shirt_number ? `${player.name} #${player.shirt_number}` : player.name
}

function PredictionChoice({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'h-auto min-h-14 whitespace-normal rounded-none border-border/50 px-4 py-4 text-center shadow-none',
        selected && 'border-primary bg-primary/5 text-primary',
      )}
    >
      <span className="block text-sm font-medium leading-5 tracking-tight">{label}</span>
    </Button>
  )
}

function goal_label(goal: MatchGoalItem): string {
  return goal.scorer_name
}

function goal_minute(goal: MatchGoalItem): string {
  if (goal.event_minute === null) return ''
  return goal.event_extra ? `${goal.event_minute}+${goal.event_extra}'` : `${goal.event_minute}'`
}

type GroupedGoal = {
  key: string
  label: string
  minutes: string[]
}

function group_goals(goals: MatchGoalItem[]): GroupedGoal[] {
  const grouped = new Map<string, GroupedGoal>()
  for (const goal of goals) {
    const key = goal.player_id ?? `${goal.team_id ?? 'unknown'}:${goal.scorer_name}`
    const existing = grouped.get(key)
    const minute = goal_minute(goal)
    if (existing) {
      if (minute) existing.minutes.push(minute)
      continue
    }
    grouped.set(key, {
      key,
      label: goal_label(goal),
      minutes: minute ? [minute] : [],
    })
  }
  return Array.from(grouped.values())
}

function has_extra_time_score(match: MatchDetailResponse['match']): boolean {
  return ['AET', 'PEN'].includes(match.status) && match.final_home_score !== null && match.final_away_score !== null
}

function display_score(match: MatchDetailResponse['match']): string {
  const useFinal = has_extra_time_score(match)
  const homeScore = useFinal ? match.final_home_score : match.home_score
  const awayScore = useFinal ? match.final_away_score : match.away_score
  return homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : 'vs'
}

function score_context(match: MatchDetailResponse['match']): string | null {
  if (match.status === 'AET') return 'After extra time'
  if (match.status === 'PEN') return 'After penalties'
  if (match.status === 'FT') return 'After Full Time'
  return null
}

function outcome_label(value: string, home: string, away: string): string {
  if (value === 'home') return home
  if (value === 'away') return away
  return 'Draw'
}

function PointsBadge({ points, active }: { points: number; active: boolean }) {
  return (
    <span className={cn('shrink-0 text-sm font-medium tabular-nums text-muted-foreground/60', active && 'text-primary')}>
      + {points}
    </span>
  )
}

function is_live_match(status: string): boolean {
  return liveScoreStatuses.has(status)
}

function prediction_status_label(match: MatchDetailResponse['match']): string {
  const status = match.user_prediction?.status
  if (status === 'settled') return 'Settled'
  if (status === 'void') return 'Voided'
  if (is_live_match(match.status)) return 'Live'
  if (status === 'locked') return 'Locked'
  return 'Pending'
}

function GamePredictionsSection({ match, players }: { match: MatchDetailResponse['match']; players: PlayerItem[] }) {
  const prediction = match.user_prediction
  const scorer = prediction ? players.find((player) => player.player_id === prediction.scorer_player_id) : null

  if (!prediction) {
    return (
      <section className="space-y-4 border-b border-border/40 pb-8">
        <h2 className="text-center text-sm font-medium tracking-tight">Game Predictions</h2>
        <p className="text-center text-sm text-muted-foreground/60">Make your picks below before the match locks.</p>
      </section>
    )
  }

  const rows = [
    { label: 'Match Result', value: outcome_label(prediction.outcome_pick, match.home_team.name, match.away_team.name), points: 10, active: prediction.outcome_correct === true },
    { label: 'Both Teams To Score', value: prediction.btts_pick ? 'Yes' : 'No', points: 10, active: prediction.btts_correct === true },
    { label: 'Scorer', value: scorer ? player_label(scorer) : 'Selected scorer', points: 25, active: prediction.scorer_correct === true },
    { label: 'Hatrick Bonus', value: null, points: 15, active: prediction.hatrick_bonus_awarded },
  ]

  return (
    <section className="space-y-5 border-b border-border/40 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Game Predictions</h2>
          <p className={cn('mt-1 text-sm font-medium', is_live_match(match.status) && prediction.status !== 'settled' && prediction.status !== 'void' && 'text-destructive')}>
            {prediction_status_label(match)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary tabular-nums">{prediction.points} / 60</p>
          <p className="mt-1 text-xs text-muted-foreground/60">points acquired</p>
        </div>
      </div>
      <div className="divide-y divide-border/30 border-t border-border/40">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-4 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {row.label}
                {row.value && <span className="text-muted-foreground"> - {row.value}</span>}
              </p>
            </div>
            <PointsBadge points={row.points} active={row.active} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function MatchDetailPage() {
  const { match_id } = useParams()
  const navigate = useNavigate()
  const profile = use_dashboard_store((s) => s.profile)
  const setTopNavBack = use_ui_store((s) => s.set_top_nav_back)
  const timezone = profile?.timezone ?? 'UTC'
  const [detail, setDetail] = useState<MatchDetailResponse | null>(() => (match_id ? get_cached_match_detail(match_id) : null))
  const [loading, setLoading] = useState(() => !(match_id && get_cached_match_detail(match_id)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<UpsertPredictionRequest['outcome_pick']>('home')
  const [btts, setBtts] = useState<boolean>(true)
  const [scorerTeamId, setScorerTeamId] = useState<string>('')
  const [scorerId, setScorerId] = useState<string>('')

  function hydratePredictionState(response: MatchDetailResponse) {
    const prediction = response.match.user_prediction
    const predictedPlayer = prediction ? response.players.find((player) => player.player_id === prediction.scorer_player_id) : null
    const defaultTeamId = predictedPlayer?.team_id ?? response.match.home_team.team_id
    const defaultPlayer = response.players.find((player) => player.team_id === defaultTeamId)
    setOutcome(prediction?.outcome_pick ?? 'home')
    setBtts(prediction?.btts_pick ?? true)
    setScorerTeamId(defaultTeamId)
    setScorerId(prediction?.scorer_player_id ?? defaultPlayer?.player_id ?? '')
  }

  useEffect(() => {
    if (!profile) load_profile().catch(() => undefined)
  }, [profile])

  useEffect(() => {
    setTopNavBack(() => navigate(ROUTES.DASHBOARD_MATCHES))
    return () => setTopNavBack(null)
  }, [navigate, setTopNavBack])

  useEffect(() => {
    if (!match_id) return
    let cancelled = false
    const cached = get_cached_match_detail(match_id)
    if (cached) {
      setDetail(cached)
      hydratePredictionState(cached)
      setLoading(false)
    }
    const load = () => {
      if (!cached) {
        setLoading(true)
        setError(null)
      }
      load_match_detail(match_id, true)
        .then((response) => {
          if (cancelled) return
          setDetail(response)
          hydratePredictionState(response)
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load match.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [match_id])

  useEffect(() => {
    if (!match_id) return
    const syncFromCache = () => {
      const cached = get_cached_match_detail(match_id)
      if (cached) {
        setDetail(cached)
        hydratePredictionState(cached)
      }
    }
    window.addEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
  }, [match_id])

  const players = useMemo(() => detail?.players ?? [], [detail])
  const goals = useMemo(() => detail?.goals ?? [], [detail])
  const match = detail?.match
  const locked = !match || match.is_locked || match.is_settled || match.is_void
  const matchStarted = !!match && !['NS', 'TBD'].includes(match.status)
  const homeGoals = useMemo(() => goals.filter((goal) => goal.team_id === match?.home_team.team_id), [goals, match])
  const awayGoals = useMemo(() => goals.filter((goal) => goal.team_id === match?.away_team.team_id), [goals, match])
  const groupedHomeGoals = useMemo(() => group_goals(homeGoals), [homeGoals])
  const groupedAwayGoals = useMemo(() => group_goals(awayGoals), [awayGoals])
  const playersByTeam = useMemo(() => {
    if (!match) return []
    return [
      { teamId: match.home_team.team_id, teamName: match.home_team.name, players: players.filter((p) => p.team_id === match.home_team.team_id) },
      { teamId: match.away_team.team_id, teamName: match.away_team.name, players: players.filter((p) => p.team_id === match.away_team.team_id) },
    ]
  }, [match, players])
  const selectedTeamPlayers = useMemo(
    () => playersByTeam.find((group) => group.teamId === scorerTeamId)?.players ?? [],
    [playersByTeam, scorerTeamId],
  )
  const visibleScorerPlayers = useMemo(() => {
    const selectedPlayer = players.find((player) => player.player_id === scorerId)
    if (!selectedPlayer || selectedTeamPlayers.some((player) => player.player_id === selectedPlayer.player_id)) return selectedTeamPlayers
    return [selectedPlayer, ...selectedTeamPlayers]
  }, [players, scorerId, selectedTeamPlayers])
  const selectedScorer = players.find((player) => player.player_id === scorerId) ?? null

  const changeScorerTeam = (teamId: string) => {
    setScorerTeamId(teamId)
    const nextPlayer = players.find((player) => player.team_id === teamId)
    setScorerId(nextPlayer?.player_id ?? '')
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!match_id || !scorerId) return
    setSaving(true)
    setError(null)
    try {
      await save_match_prediction(match_id, { outcome_pick: outcome, btts_pick: btts, scorer_player_id: scorerId })
      const refreshed = await load_match_detail(match_id, true)
      setDetail(refreshed)
      hydratePredictionState(refreshed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save prediction.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="mx-auto flex w-full flex-col gap-8 px-4 pb-8 pt-2 sm:px-6 sm:pb-8 sm:pt-5">
          <MatchDetailSkeleton />
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="mx-auto w-full px-4 pb-8 pt-5 sm:px-6 sm:py-8">
        <ErrorAlert message={error ?? 'Match not found.'} />
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto flex w-full flex-col gap-7 px-4 pb-8 pt-2 sm:gap-8 sm:px-6 sm:pb-8 sm:pt-5">
        <section className="border-b border-border/40 pb-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">{match.competition.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{format_kickoff(match.kickoff_at, timezone)}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">
              {locked && <LockKeyhole className="h-4 w-4" />}
              {match.status}
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] sm:gap-5">
            <div className="flex min-w-0 flex-col items-center gap-3 text-center">
              {team_logo(match.home_team.logo_url, match.home_team.name)}
              <h1 className="line-clamp-2 text-base font-medium leading-tight sm:text-xl">{match.home_team.name}</h1>
            </div>
            <div className="pt-4 text-center sm:pt-3">
              <div className={cn('text-2xl tabular-nums', is_live_match(match.status) && 'text-destructive')}>{display_score(match)}</div>
              {score_context(match) && (
                <div className="mt-1 text-xs font-semibold text-primary sm:text-sm">{score_context(match)}</div>
              )}
            </div>
            <div className="flex min-w-0 flex-col items-center gap-3 text-center">
              {team_logo(match.away_team.logo_url, match.away_team.name)}
              <h1 className="line-clamp-2 text-base font-medium leading-tight sm:text-xl">{match.away_team.name}</h1>
            </div>
          </div>
        </section>

        <ErrorAlert message={error} onDismiss={() => setError(null)} />

        {(goals.length > 0 || locked) && (
          <section className="space-y-4 border-b border-border/40 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Goals</h2>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">{match.status_long ?? match.status}</span>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">Goal scorers will appear here after the first goal is scored.</p>
            ) : (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                <div className="space-y-2 text-right">
                  {groupedHomeGoals.map((goal) => (
                    <div key={goal.key} className="text-sm">
                      <span className="font-medium">{goal.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{goal.minutes.join(', ')}</span>
                    </div>
                  ))}
                </div>
                <div className="w-px bg-border/40" />
                <div className="space-y-2 text-left">
                  {groupedAwayGoals.map((goal) => (
                    <div key={goal.key} className="text-sm">
                      <span className="font-medium">{goal.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{goal.minutes.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {matchStarted && <GamePredictionsSection match={match} players={players} />}

        {!locked && (
        <form onSubmit={submit} className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Winner</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <PredictionChoice label={match.home_team.name} selected={outcome === 'home'} onClick={() => setOutcome('home')} />
              <PredictionChoice label="Draw" selected={outcome === 'draw'} onClick={() => setOutcome('draw')} />
              <PredictionChoice label={match.away_team.name} selected={outcome === 'away'} onClick={() => setOutcome('away')} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Both Teams To Score</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PredictionChoice label="Yes" selected={btts} onClick={() => setBtts(true)} />
              <PredictionChoice label="No" selected={!btts} onClick={() => setBtts(false)} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Scorer</h2>
            <div className="grid gap-3 sm:grid-cols-[0.75fr_1.25fr]">
              <Select value={scorerTeamId} onValueChange={changeScorerTeam} disabled={locked || players.length === 0}>
                <SelectTrigger className="h-11 bg-input-background shadow-[1.5px_1.5px_0_#000]">
                  <SelectValue placeholder="Choose team" />
                </SelectTrigger>
                <SelectContent>
                  {playersByTeam.map((group) => (
                    <SelectItem key={group.teamId} value={group.teamId}>
                      {group.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={scorerId} onValueChange={setScorerId} disabled={locked || visibleScorerPlayers.length === 0}>
                <SelectTrigger className="h-11 bg-input-background shadow-[1.5px_1.5px_0_#000]">
                  <SelectValue placeholder={visibleScorerPlayers.length ? 'Choose player' : 'Choose team first'} />
                </SelectTrigger>
                <SelectContent>
                  {visibleScorerPlayers.map((player) => (
                    <SelectItem key={player.player_id} value={player.player_id}>
                      {player_label(player)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScorer && (
                <p className="text-xs text-muted-foreground">
                  Current chosen AGS: <span className="font-medium text-foreground">{player_label(selectedScorer)}</span>
                </p>
              )}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-border/40 pt-5">
            <p className="text-xs text-muted-foreground/60">
              {locked ? 'Predictions are locked for this match.' : 'Locks 5 minutes before kickoff.'}
            </p>
            <Button type="submit" className="h-10 min-w-32" disabled={locked || saving || !scorerId}>
              {saving ? <LoadingSpinner size="sm" className="mr-2" /> : match.user_prediction ? <Check className="mr-2 h-4 w-4" /> : null}
              {match.user_prediction ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
        )}

        {locked && (
          <div>
            <p className="text-xs text-muted-foreground/60">Predictions are locked for this match. You can view the score and synced goal events.</p>
          </div>
        )}
      </div>
    </div>
  )
}
