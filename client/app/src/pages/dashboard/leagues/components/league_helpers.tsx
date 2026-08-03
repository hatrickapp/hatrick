import type { LeagueScoringItem, LeagueSummaryItem } from '@/types/league_types'
import { competition_logo_image_class } from '@/lib/competition_logo'
import { cn } from '@/lib/utils'

export function date_time_input(offsetDays = 0) {
  const value = new Date()
  value.setSeconds(0, 0)
  if (value.getMinutes() >= 30) value.setHours(value.getHours() + 1)
  value.setMinutes(0)
  value.setDate(value.getDate() + offsetDays)
  return date_to_input(value)
}

export function date_to_input(value: Date) {
  const pad = (part: number) => `${part}`.padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function parse_input_date(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export function start_of_day(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function add_days(value: Date, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

export function same_month(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

export function clamp_date_time(value: string, minDate: Date, maxDate?: Date) {
  const current = parse_input_date(value)
  const min = start_of_day(minDate)
  const max = maxDate ? start_of_day(maxDate) : null
  if (current < min) return date_to_input(min)
  if (max && current > max) return date_to_input(max)
  return value
}

export function parse_positive_int(value: string) {
  if (!/^\d+$/.test(value)) return null
  return Number(value)
}

export function numeric_input(value: string) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
}

export function format_date(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function format_date_range(startValue: string, endValue: string) {
  const start = parse_input_date(startValue)
  const end = parse_input_date(endValue)
  const startText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start)
  const endText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).format(end)
  return `${startText} to ${endText}`
}

export function format_full_date_time(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parse_input_date(value))
}

export function update_date_part(value: string, date: Date) {
  const current = parse_input_date(value)
  current.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
  return date_to_input(current)
}

export function update_time_part(value: string, time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const current = parse_input_date(value)
  current.setHours(hour || 0, minute || 0, 0, 0)
  return date_to_input(current)
}

export function competition_logo(src: string | null, name: string) {
  if (!src) return <span className="h-6 w-6 rounded-full bg-primary/10" />
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden">
      <img src={src} alt={name} className={cn('h-6 w-6 object-contain', competition_logo_image_class(name))} loading="lazy" />
    </span>
  )
}

export function league_status_label(status: LeagueSummaryItem['status']) {
  if (status === 'active') return 'Active'
  if (status === 'paused') return 'Paused'
  if (status === 'closed') return 'Closed'
  if (status === 'finished') return 'Finished'
  return 'Deleted'
}

export function scoring_label(scoring: LeagueScoringItem) {
  if (scoring.only_hatricks) return 'Hatricks only'
  const parts = []
  if (scoring.include_outcome_points) parts.push('Winner')
  if (scoring.include_btts_points) parts.push('BTTS')
  if (scoring.include_scorer_points) parts.push('Scorer')
  if (scoring.include_hatrick_bonus) parts.push('Bonus')
  return parts.join(' + ') || 'Custom'
}
