import { SelectableOption } from '@/components/shared/selectable_option'
import { FeatureHeading, LockedFeatureText } from './league_form_labels'
import { LockedPlusOption, PlusSelectableOption } from './locked_plus_option'
import type { LeagueScoringPresetItem } from '@/types/league_types'

export function LeagueScoringSelector({
  canCustomize,
  scoringKey,
  scoringPresets,
  onChange,
  onUpgrade,
}: {
  canCustomize: boolean
  scoringKey: string
  scoringPresets: LeagueScoringPresetItem[]
  onChange: (key: string) => void
  onUpgrade: () => void
}) {
  return (
    <div className="border-t border-border/30 pt-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 sm:text-xs sm:tracking-widest">Scoring</p>
      <FeatureHeading label="Choose your scoring method" plus />
      {!canCustomize && <LockedFeatureText text="Free leagues use Full Hatrick scoring. Tap a method to unlock custom scoring." />}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
        {scoringPresets.map((preset) => {
          const isDefault = preset.is_default
          if (isDefault) {
            return (
              <SelectableOption
                key={preset.preset_key}
                active={scoringKey === preset.preset_key}
                title={preset.label}
                description={preset.description}
                onClick={() => onChange(preset.preset_key)}
                className="min-h-24 items-center justify-center px-3 py-4 text-center [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:gap-1 sm:min-h-12 sm:px-4 sm:py-2.5"
              />
            )
          }
          if (!canCustomize) {
            return (
              <LockedPlusOption
                key={preset.preset_key}
                title={preset.label}
                description={preset.description}
                onClick={onUpgrade}
                className="min-h-24 px-3 py-4 sm:min-h-12 sm:px-4 sm:py-2.5"
              />
            )
          }
          return (
            <PlusSelectableOption
              key={preset.preset_key}
              active={scoringKey === preset.preset_key}
              title={preset.label}
              description={preset.description}
              onClick={() => onChange(preset.preset_key)}
              className="min-h-24 items-center justify-center px-3 py-4 text-center [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:gap-1 sm:min-h-12 sm:px-4 sm:py-2.5"
            />
          )
        })}
      </div>
    </div>
  )
}
