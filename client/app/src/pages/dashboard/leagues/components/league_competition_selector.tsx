import { SelectableOption } from '@/components/shared/selectable_option'
import type { CompetitionItem } from '@/types/sports_types'
import { competition_logo } from './league_helpers'
import { FeatureHeading, LockedFeatureText } from './league_form_labels'
import { LockedPlusOption, PlusSelectableOption } from './locked_plus_option'

export type CompetitionMode = 'all' | 'custom'

export function LeagueCompetitionSelector({
  competitions,
  canCustomize,
  mode,
  selectedCompetitionIds,
  onModeChange,
  onToggleCompetition,
  onUpgrade,
}: {
  competitions: CompetitionItem[]
  canCustomize: boolean
  mode: CompetitionMode
  selectedCompetitionIds: string[]
  onModeChange: (mode: CompetitionMode) => void
  onToggleCompetition: (competitionId: string) => void
  onUpgrade: () => void
}) {
  return (
    <div className="border-t border-border/30 pt-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 sm:text-xs sm:tracking-widest">Competitions</p>
      <FeatureHeading label="Choose the competitions" plus />
      {!canCustomize && <LockedFeatureText text="Free leagues include every supported competition. Tap any option to unlock custom picks." />}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
        <SelectableOption
          active={mode === 'all'}
          title="All competitions"
          description={`${competitions.length} supported competitions`}
          onClick={() => onModeChange('all')}
          className="min-h-20 items-center justify-center px-2 text-center sm:min-h-12 [&>span>span:last-child]:whitespace-nowrap [&>span]:flex [&>span]:flex-col [&>span]:items-center"
        />
        {canCustomize ? (
          <PlusSelectableOption
            active={mode === 'custom'}
            title="Select competitions"
            description="Choose your leagues"
            onClick={() => onModeChange('custom')}
            className="min-h-20 items-center justify-center text-center sm:min-h-12 [&>span]:items-center"
          />
        ) : (
          <LockedPlusOption
            title="Select competitions"
            description="Unlock custom picks"
            onClick={onUpgrade}
            className="sm:min-h-12"
          />
        )}
      </div>

      {canCustomize && mode === 'custom' && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2">
          {competitions.map((competition) => {
            const active = selectedCompetitionIds.includes(competition.competition_id)
            return (
              <PlusSelectableOption
                key={competition.competition_id}
                active={active}
                title={competition.name}
                icon={competition_logo(competition.logo_url, competition.name)}
                onClick={() => onToggleCompetition(competition.competition_id)}
                className="min-h-20 flex-col items-center justify-center gap-2 px-2 py-3 text-center sm:min-h-12 sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 sm:text-left"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
