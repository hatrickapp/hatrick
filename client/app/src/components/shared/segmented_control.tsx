import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SegmentTone = 'default' | 'destructive'

export type SegmentedControlItem<TValue extends string> = {
  value: TValue
  label: string
  href?: string
  icon?: ComponentType<{ className?: string }>
  tone?: SegmentTone
}

export function SegmentedControl<TValue extends string>({
  items,
  value,
  onValueChange,
  columns,
  className,
  itemClassName,
}: {
  items: SegmentedControlItem<TValue>[]
  value: TValue
  onValueChange?: (value: TValue) => void
  columns?: 2 | 3 | 4
  className?: string
  itemClassName?: string
}) {
  return (
    <div
      className={cn(
        'grid border border-border/50 text-sm font-medium',
        columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        const Icon = item.icon
        const buttonClassName = cn(
          'min-h-10 touch-manipulation rounded-none px-4 text-sm font-medium shadow-none ',
          active
            ? 'bg-primary text-primary-foreground  '
            : cn('text-muted-foreground/45 ', item.tone === 'destructive' && 'text-destructive'),
          itemClassName,
        )

        const content = (
          <>
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span>{item.label}</span>
          </>
        )

        if (item.href) {
          return (
            <Button key={item.value} type="button" variant="ghost" className={buttonClassName} asChild>
              <Link to={item.href}>{content}</Link>
            </Button>
          )
        }

        return (
          <Button
            key={item.value}
            type="button"
            variant="ghost"
            onPointerDown={() => onValueChange?.(item.value)}
            onClick={() => onValueChange?.(item.value)}
            className={buttonClassName}
          >
            {content}
          </Button>
        )
      })}
    </div>
  )
}
