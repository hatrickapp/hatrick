import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LockedPlusOption({
  title,
  description,
  onClick,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'plus-gold-surface relative h-auto min-h-20 overflow-hidden rounded-none border-[#D4AF37]/80 px-3 py-4 text-center text-foreground shadow-none  ',
        className,
      )}
    >
      <span className="relative z-10 flex min-w-0 flex-col items-center gap-1">
        <span className="block text-sm font-medium leading-5 tracking-tight">{title}</span>
        {description && (
          <span className="block text-xs font-normal leading-[1.35] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </Button>
  )
}

export function PlusSelectableOption({
  active,
  title,
  description,
  icon,
  onClick,
  className,
}: {
  active: boolean
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'relative h-auto min-h-12 overflow-hidden rounded-none border-[#D4AF37]/70 px-4 py-2.5 text-left text-foreground shadow-none  ',
        !active && 'plus-gold-surface',
        active && 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]  ',
        className,
      )}
    >
      {icon && <span className="relative z-10 shrink-0">{icon}</span>}
      <span className={cn('relative z-10 min-w-0', description && 'flex flex-col gap-px')}>
        <span className="block text-sm font-medium leading-5 tracking-tight">{title}</span>
        {description && (
          <span className="block text-xs font-normal leading-[1.35] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </Button>
  )
}
