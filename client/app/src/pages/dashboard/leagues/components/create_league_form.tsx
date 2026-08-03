import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { ApiRequestError } from '@/api/client'
import { create_hatrick_league } from '@/controllers/leagues_controller'
import { navigate_to_upgrade } from '@/lib/upgrade_navigation'
import type { CreateLeagueRequest, LeagueLimitItem, LeagueScoringPresetItem, LeagueSummaryItem, PlanLimitItem } from '@/types/league_types'
import type { CompetitionItem } from '@/types/sports_types'
import { DateTimeField } from './date_time_field'
import { LeagueCompetitionSelector, type CompetitionMode } from './league_competition_selector'
import { LeagueMemberPointsSelector } from './league_member_points_selector'
import { LeagueScoringSelector } from './league_scoring_selector'
import {
  add_days,
  date_time_input,
  numeric_input,
  parse_input_date,
  parse_positive_int,
  start_of_day,
} from './league_helpers'

const MAX_LEAGUE_PLAYERS_INPUT = 2500

function max_players_input(value: string): string {
  const normalized = numeric_input(value)
  if (!normalized) return ''
  return String(Math.min(Number(normalized), MAX_LEAGUE_PLAYERS_INPUT))
}

export function CreateLeagueForm({
  competitions,
  canCreate,
  planLimits,
  leagueLimits,
  scoringPresets,
  onCreated,
}: {
  competitions: CompetitionItem[]
  canCreate: boolean
  planLimits: PlanLimitItem
  leagueLimits: LeagueLimitItem
  scoringPresets: LeagueScoringPresetItem[]
  onCreated: (league: LeagueSummaryItem) => void
}) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [competitionMode, setCompetitionMode] = useState<CompetitionMode>('all')
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([])
  const defaultScoringPreset = scoringPresets.find((preset) => preset.is_default) ?? scoringPresets[0]
  const [scoringKey, setScoringKey] = useState(defaultScoringPreset.preset_key)
  const [startsAt, setStartsAt] = useState(date_time_input(0))
  const [endsAt, setEndsAt] = useState(date_time_input(30))
  const [includeExisting, setIncludeExisting] = useState(false)
  const [maxMembers, setMaxMembers] = useState(String(Math.min(leagueLimits.default_max_members, MAX_LEAGUE_PLAYERS_INPUT)))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const canCustomizeCompetitions = planLimits.can_customize_competitions
  const canCustomizeScoring = planLimits.can_customize_scoring
  const canCountExistingPoints = planLimits.can_count_existing_points
  const allCompetitionIds = competitions.map((competition) => competition.competition_id)
  const scoring = scoringPresets.find((preset) => preset.preset_key === scoringKey)?.scoring ?? defaultScoringPreset.scoring
  const effectiveCompetitionIds = !canCustomizeCompetitions || competitionMode === 'all' ? allCompetitionIds : selectedCompetitions
  const effectiveScoring = canCustomizeScoring ? scoring : defaultScoringPreset.scoring
  const effectiveIncludeExisting = canCountExistingPoints ? includeExisting : false
  const canSubmit = name.trim().length >= 3 && effectiveCompetitionIds.length > 0 && !submitting
  const startMinDate = start_of_day(new Date())
  const startMaxDate = add_days(startMinDate, leagueLimits.max_start_days_ahead)
  const selectedStartDate = start_of_day(parse_input_date(startsAt))
  const endMinDate = add_days(selectedStartDate > startMinDate ? selectedStartDate : startMinDate, 1)
  const endMaxDate = add_days(selectedStartDate, leagueLimits.max_period_days)

  function openUpgrade() {
    navigate_to_upgrade(navigate, { leaguesMode: 'create' })
  }

  function toggleCompetition(competitionId: string) {
    setSelectedCompetitions((current) =>
      current.includes(competitionId)
        ? current.filter((id) => id !== competitionId)
        : [...current, competitionId]
    )
  }

  async function submit() {
    if (!canSubmit) return
    if (!canCreate && planLimits.plan === 'free') {
      openUpgrade()
      return
    }

    const maxAllowedMembers = Math.min(leagueLimits.max_members, MAX_LEAGUE_PLAYERS_INPUT)
    const normalizedMaxMembers = parse_positive_int(maxMembers || String(Math.min(leagueLimits.default_max_members, maxAllowedMembers)))
    const nextErrors: Record<string, string> = {}
    if (!normalizedMaxMembers || normalizedMaxMembers < 2 || normalizedMaxMembers > maxAllowedMembers) {
      nextErrors.maxMembers = `Maximum players must be 2 to ${maxAllowedMembers.toLocaleString()}.`
    }
    if (parse_input_date(startsAt) < startMinDate) {
      nextErrors.startsAt = 'Start date cannot be before today.'
    }
    if (parse_input_date(endsAt) < endMinDate) {
      nextErrors.endsAt = 'End date must be after the start date.'
    }
    if (parse_input_date(endsAt) > endMaxDate) {
      nextErrors.endsAt = 'End date cannot be more than one year after the start date.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const maxMembersValue = Math.min(normalizedMaxMembers ?? leagueLimits.default_max_members, maxAllowedMembers)
    setSubmitting(true)
    setError(null)
    const body: CreateLeagueRequest = {
      name,
      competition_ids: effectiveCompetitionIds,
      scoring: effectiveScoring,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      include_existing_points: effectiveIncludeExisting,
      max_members: maxMembersValue,
    }
    try {
      const response = await create_hatrick_league(body)
      onCreated(response.league)
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'LEAGUE_LIMIT_REACHED' && planLimits.plan === 'free') {
        openUpgrade()
        return
      }
      setError(err instanceof Error ? err.message : 'Could not create league.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div className="space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">League Identity</p>
          <p className="mt-2 text-sm font-medium tracking-tight">Name your league</p>
          <div className="mt-4 grid max-w-sm gap-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="League name" className="h-10 bg-input-background text-foreground" />
          </div>
        </div>

        <LeagueCompetitionSelector
          competitions={competitions}
          canCustomize={canCustomizeCompetitions}
          mode={competitionMode}
          selectedCompetitionIds={selectedCompetitions}
          onModeChange={setCompetitionMode}
          onToggleCompetition={toggleCompetition}
          onUpgrade={openUpgrade}
        />

        <LeagueScoringSelector
          canCustomize={canCustomizeScoring}
          scoringKey={canCustomizeScoring ? scoringKey : defaultScoringPreset.preset_key}
          scoringPresets={scoringPresets}
          onChange={(key) => {
            if (canCustomizeScoring || key === defaultScoringPreset.preset_key) setScoringKey(key)
          }}
          onUpgrade={openUpgrade}
        />

        <div className="border-t border-border/30 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Period</p>
          <div className="mt-2 grid max-w-sm gap-5">
            <DateTimeField label="Start date" value={startsAt} onChange={setStartsAt} minDate={startMinDate} maxDate={startMaxDate} />
            {fieldErrors.startsAt && <p className="text-xs text-destructive">{fieldErrors.startsAt}</p>}
            <DateTimeField label="End date" value={endsAt} onChange={setEndsAt} minDate={endMinDate} maxDate={endMaxDate} />
            {fieldErrors.endsAt && <p className="text-xs text-destructive">{fieldErrors.endsAt}</p>}
          </div>
        </div>

        <div className="border-t border-border/30 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Joining Rules</p>
          <div className="mt-2 grid max-w-sm gap-5">
            <div>
              <p className="text-sm font-medium tracking-tight">Maximum players</p>
              <Input
                inputMode="numeric"
                max={MAX_LEAGUE_PLAYERS_INPUT}
                value={maxMembers}
                onBlur={() => {
                  if (!maxMembers) setMaxMembers(String(Math.min(leagueLimits.default_max_members, MAX_LEAGUE_PLAYERS_INPUT)))
                }}
                onChange={(event) => setMaxMembers(max_players_input(event.target.value))}
                className="mt-2 h-10 bg-input-background text-foreground"
              />
              {fieldErrors.maxMembers && <p className="mt-2 text-xs text-destructive">{fieldErrors.maxMembers}</p>}
            </div>
            <LeagueMemberPointsSelector
              canCountExisting={canCountExistingPoints}
              includeExisting={effectiveIncludeExisting}
              onChange={(value) => {
                if (canCountExistingPoints || !value) setIncludeExisting(value)
              }}
              onUpgrade={openUpgrade}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 border-t border-border/30 pt-5">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <Button disabled={!canSubmit} onClick={submit} className="min-w-36">
          {submitting && <LoadingSpinner size="sm" className="mr-2" />}
          {submitting ? 'Creating' : 'Create League'}
        </Button>
      </div>
      <div className="h-[calc(env(safe-area-inset-bottom)+2rem)] sm:h-6" aria-hidden="true" />
    </section>
  )
}
