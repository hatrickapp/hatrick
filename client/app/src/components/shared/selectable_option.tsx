import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SelectableOption({
  active,
  title,
  description,
  icon,
  onClick,
  disabled = false,
  className,
}: {
  active: boolean
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-auto min-h-12 whitespace-normal rounded-none border-border/50 px-4 py-2.5 text-left shadow-none  ',
        'justify-start',
        description && 'items-start',
        active && 'border-primary bg-primary/5 text-primary   ',
        disabled && 'cursor-not-allowed opacity-60  ',
        className,
      )}
    >
      {icon}
      <span className={cn('min-w-0', description && 'flex flex-col gap-px')}>
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
