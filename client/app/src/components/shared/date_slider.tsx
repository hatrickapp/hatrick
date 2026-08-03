import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

function add_days(value: Date, days: number): Date {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

function local_day_key(value: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(value)

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '00'
  const day = parts.find((part) => part.type === 'day')?.value ?? '00'
  return `${year}-${month}-${day}`
}

function date_label(value: Date, selectedKey: string, timezone: string): string {
  const today = local_day_key(new Date(), timezone)
  const yesterday = local_day_key(add_days(new Date(), -1), timezone)
  if (selectedKey === today) return 'Today'
  if (selectedKey === yesterday) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
    weekday: 'short',
  }).format(value)
}

export function DateSlider({
  selectedDate,
  timezone,
  onDateChange,
  scrollable = true,
  daysBack = 8,
}: {
  selectedDate: string
  timezone: string
  onDateChange: (value: string) => void
  scrollable?: boolean
  daysBack?: number
}) {
  const today = new Date()
  const selectedRef = useRef<HTMLButtonElement | null>(null)
  const items = Array.from({ length: daysBack + 1 }, (_, index) => {
    const date = add_days(today, index - daysBack)
    const key = local_day_key(date, timezone)
    return { key, label: date_label(date, key, timezone) }
  })

  useLayoutEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
  }, [selectedDate])

  return (
    <div className={cn('-mx-4 px-4 scrollbar-none sm:-mx-6 sm:px-6', scrollable ? 'overflow-x-auto' : 'overflow-x-hidden')}>
      <div className="flex min-w-max items-center justify-center gap-7 py-1 before:block before:w-[42vw] before:shrink-0 after:block after:w-[42vw] after:shrink-0">
        {items.map((item) => {
          const selected = item.key === selectedDate
          return (
            <button
              key={item.key}
              ref={selected ? selectedRef : undefined}
              type="button"
              onClick={() => onDateChange(item.key)}
              className={cn(
                'shrink-0 text-sm font-medium tracking-tight text-muted-foreground/45 transition-colors',
                selected && 'text-foreground',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
