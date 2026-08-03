import { SelectableOption } from '@/components/shared/selectable_option'
import { FeatureHeading, LockedFeatureText } from './league_form_labels'
import { LockedPlusOption, PlusSelectableOption } from './locked_plus_option'

const COUNT_FROM_START_DESCRIPTION = 'Settled picks from league start count too.'

export function LeagueMemberPointsSelector({
  canCountExisting,
  includeExisting,
  onChange,
  onUpgrade,
}: {
  canCountExisting: boolean
  includeExisting: boolean
  onChange: (includeExisting: boolean) => void
  onUpgrade: () => void
}) {
  return (
    <div>
      <FeatureHeading label="New member points" plus />
      {!canCountExisting && <LockedFeatureText text="Free leagues start new members at 0. Tap to unlock late join controls." />}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SelectableOption
          active={!includeExisting}
          title="Start at 0"
          description="Only picks after joining count."
          onClick={() => onChange(false)}
          className="min-h-16 items-center justify-center px-4 py-2.5 text-center [&>span]:flex [&>span]:flex-col [&>span]:items-center"
        />
        {canCountExisting ? (
          <PlusSelectableOption
            active={includeExisting}
            title="Count from start date"
            description={COUNT_FROM_START_DESCRIPTION}
            onClick={() => onChange(true)}
            className="min-h-16 items-center justify-center px-4 py-2.5 text-center [&>span]:flex [&>span]:flex-col [&>span]:items-center"
          />
        ) : (
          <LockedPlusOption
            title="Count from start date"
            description={COUNT_FROM_START_DESCRIPTION}
            onClick={onUpgrade}
            className="min-h-16 px-4 py-2.5"
          />
        )}
      </div>
    </div>
  )
}
