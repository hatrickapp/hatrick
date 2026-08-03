import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { clamp_date_time, format_full_date_time, parse_input_date, same_month, start_of_day, update_date_part, update_time_part } from './league_helpers'

export function DateTimeField({
  label,
  description,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  minDate: Date
  maxDate?: Date
}) {
  const selectedDate = parse_input_date(value)
  const minDay = start_of_day(minDate)
  const maxDay = maxDate ? start_of_day(maxDate) : null
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const [draftTime, setDraftTime] = useState('')
  const days = useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: firstDay.getDay() }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), index + 1)),
    ]
  }, [viewMonth])
  const timeValue = `${`${selectedDate.getHours()}`.padStart(2, '0')}:${`${selectedDate.getMinutes()}`.padStart(2, '0')}`
  const canGoPrevious = !same_month(viewMonth, minDay)
  const canGoNext = !maxDay || !same_month(viewMonth, maxDay)

  useEffect(() => {
    setDraftTime(timeValue)
  }, [timeValue])

  useEffect(() => {
    const clamped = clamp_date_time(value, minDay, maxDay ?? undefined)
    if (clamped !== value) onChange(clamped)
  }, [maxDay, minDay, onChange, value])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div ref={containerRef}>
      <p className="text-sm font-medium tracking-tight">{label}</p>
      {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex h-10 w-full items-center justify-between rounded-md bg-input-background px-3 text-left text-sm font-medium text-foreground shadow-[1.5px_1.5px_0_#000]"
      >
        <span>{format_full_date_time(value)}</span>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </Button>
      {open && (
        <div className="mt-3 border border-border/50 bg-background p-4">
          <div className="flex items-center justify-between">
            {canGoPrevious ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : <span className="h-10 w-10" />}
            <p className="text-sm font-medium tracking-tight">
              {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewMonth)}
            </p>
            {canGoNext ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : <span className="h-10 w-10" />}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const selected = day && day.toDateString() === selectedDate.toDateString()
              const disabled = !day || day < minDay || Boolean(maxDay && day > maxDay)
              return day ? (
                <Button
                  key={day.toISOString()}
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => {
                    onChange(update_date_part(value, day))
                    setOpen(false)
                  }}
                  className={cn(
                    'h-9 rounded-md p-0 text-sm font-medium shadow-none  disabled:pointer-events-none disabled:opacity-25',
                    selected && !disabled && 'bg-primary text-primary-foreground '
                  )}
                >
                  {day.getDate()}
                </Button>
              ) : <span key={`empty-${index}`} />
            })}
          </div>
          <div className="mt-4 border-t border-border/30 pt-4">
            <p className="text-xs font-medium text-muted-foreground">Time</p>
            <Input
              value={draftTime}
              onBlur={() => {
                if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draftTime)) setDraftTime(timeValue)
              }}
              onChange={(event) => {
                const nextTime = event.target.value
                setDraftTime(nextTime)
                if (/^([01]\d|2[0-3]):[0-5]\d$/.test(nextTime)) onChange(update_time_part(value, nextTime))
              }}
              placeholder="21:30"
              className="mt-2 h-10 bg-input-background text-foreground"
            />
          </div>
        </div>
      )}
    </div>
  )
}
