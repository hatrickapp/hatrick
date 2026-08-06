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
      <FeatureHeading label="Choose the competitions" plus={false} />
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
        <div className="mt-4 border-t border-border/30">
          {competitions.map((competition) => {
            const active = selectedCompetitionIds.includes(competition.competition_id)
            return (
              <button
                key={competition.competition_id}
                type="button"
                onClick={() => onToggleCompetition(competition.competition_id)}
                className="flex w-full items-center justify-between border-b border-border/30 py-3 px-1 text-left transition-colors hover:bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {competition_logo(competition.logo_url, competition.name)}
                  <span className="text-sm font-medium tracking-tight text-foreground truncate">
                    {competition.name}
                  </span>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
                    active
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                      : 'border-muted-foreground/40 bg-transparent'
                  }`}
                >
                  {active && (
                    <svg className="h-3.5 w-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
