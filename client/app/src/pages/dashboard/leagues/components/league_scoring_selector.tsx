import { SelectableOption } from '@/components/shared/selectable_option'
import { FeatureHeading, LockedFeatureText } from './league_form_labels'
import { LockedPlusOption, PlusSelectableOption } from './locked_plus_option'
import type { LeagueScoringPresetItem } from '@/types/league_types'

export type ScoringMode = 'default' | 'custom'

export function LeagueScoringSelector({
  canCustomize,
  mode,
  scoringKey,
  scoringPresets,
  onModeChange,
  onChange,
  onUpgrade,
}: {
  canCustomize: boolean
  mode: ScoringMode
  scoringKey: string
  scoringPresets: LeagueScoringPresetItem[]
  onModeChange: (mode: ScoringMode) => void
  onChange: (key: string) => void
  onUpgrade: () => void
}) {
  const defaultPreset = scoringPresets.find((preset) => preset.is_default) ?? scoringPresets[0]

  return (
    <div className="border-t border-border/30 pt-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 sm:text-xs sm:tracking-widest">Scoring</p>
      <FeatureHeading label="Choose your scoring method" plus={false} />
      {!canCustomize && <LockedFeatureText text="Free leagues use Full Hatrick scoring. Tap any option to unlock custom scoring." />}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
        <SelectableOption
          active={mode === 'default'}
          title="Full Hatrick"
          description="All the picks and bonus"
          onClick={() => {
            onModeChange('default')
            if (defaultPreset) onChange(defaultPreset.preset_key)
          }}
          className="min-h-20 items-center justify-center px-2 text-center sm:min-h-12 [&>span>span:last-child]:whitespace-nowrap [&>span]:flex [&>span]:flex-col [&>span]:items-center"
        />
        {canCustomize ? (
          <PlusSelectableOption
            active={mode === 'custom'}
            title="Select scoring"
            description="Choose custom scoring"
            onClick={() => onModeChange('custom')}
            className="min-h-20 items-center justify-center text-center sm:min-h-12 [&>span]:items-center"
          />
        ) : (
          <LockedPlusOption
            title="Select scoring"
            description="Unlock custom scoring"
            onClick={onUpgrade}
            className="sm:min-h-12"
          />
        )}
      </div>

      {canCustomize && mode === 'custom' && (
        <div className="mt-4 border-t border-border/30">
          {scoringPresets
            .filter((preset) => !preset.is_default)
            .map((preset) => {
              const active = scoringKey === preset.preset_key
              return (
                <button
                  key={preset.preset_key}
                  type="button"
                  onClick={() => onChange(preset.preset_key)}
                  className="flex w-full items-center justify-between border-b border-border/30 py-3.5 px-1 text-left transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-sm font-medium tracking-tight text-foreground">
                      {preset.label}
                    </span>
                    {preset.description && (
                      <span className="text-xs font-normal leading-[1.35] text-muted-foreground mt-0.5">
                        {preset.description}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      active
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                        : 'border-muted-foreground/40 bg-transparent'
                    }`}
                  >
                    {active && (
                      <div className="h-2 w-2 rounded-full bg-black" />
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

