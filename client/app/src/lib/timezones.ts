export const AUTOMATIC_TIMEZONE_VALUE = '__automatic_timezone__'

export interface TimezoneOption {
  label: string
  value: string
}

export interface TimezoneGroup {
  label: string
  options: TimezoneOption[]
}

export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    label: 'Default',
    options: [
      { label: 'Automatic', value: AUTOMATIC_TIMEZONE_VALUE },
      { label: 'UTC', value: 'UTC' },
    ],
  },
  {
    label: 'Middle East',
    options: [
      { label: 'Amman', value: 'Asia/Amman' },
      { label: 'Riyadh', value: 'Asia/Riyadh' },
      { label: 'Dubai', value: 'Asia/Dubai' },
      { label: 'Cairo', value: 'Africa/Cairo' },
      { label: 'Beirut', value: 'Asia/Beirut' },
      { label: 'Istanbul', value: 'Europe/Istanbul' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { label: 'London', value: 'Europe/London' },
      { label: 'Central Europe', value: 'Europe/Paris' },
      { label: 'Athens', value: 'Europe/Athens' },
      { label: 'Moscow', value: 'Europe/Moscow' },
    ],
  },
  {
    label: 'Americas',
    options: [
      { label: 'New York', value: 'America/New_York' },
      { label: 'Chicago', value: 'America/Chicago' },
      { label: 'Denver', value: 'America/Denver' },
      { label: 'Los Angeles', value: 'America/Los_Angeles' },
      { label: 'São Paulo', value: 'America/Sao_Paulo' },
      { label: 'Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
    ],
  },
  {
    label: 'Asia',
    options: [
      { label: 'Karachi', value: 'Asia/Karachi' },
      { label: 'Kolkata', value: 'Asia/Kolkata' },
      { label: 'Bangkok', value: 'Asia/Bangkok' },
      { label: 'Singapore', value: 'Asia/Singapore' },
      { label: 'Tokyo', value: 'Asia/Tokyo' },
      { label: 'Seoul', value: 'Asia/Seoul' },
    ],
  },
  {
    label: 'Oceania',
    options: [
      { label: 'Sydney', value: 'Australia/Sydney' },
      { label: 'Auckland', value: 'Pacific/Auckland' },
    ],
  },
]

const TIMEZONE_OPTIONS = TIMEZONE_GROUPS.flatMap((group) => group.options)
const SELECTABLE_TIMEZONE_OPTIONS = TIMEZONE_OPTIONS.filter((option) => option.value !== AUTOMATIC_TIMEZONE_VALUE)
const SELECTABLE_TIMEZONE_VALUES = new Set(SELECTABLE_TIMEZONE_OPTIONS.map((option) => option.value))

const TIMEZONE_ALIASES: Record<string, string> = {
  'Africa/Amman': 'Asia/Amman',
  'Asia/Bahrain': 'Asia/Riyadh',
  'Asia/Kuwait': 'Asia/Riyadh',
  'Asia/Qatar': 'Asia/Riyadh',
  'Asia/Muscat': 'Asia/Dubai',
  'Europe/Amsterdam': 'Europe/Paris',
  'Europe/Belgrade': 'Europe/Paris',
  'Europe/Berlin': 'Europe/Paris',
  'Europe/Brussels': 'Europe/Paris',
  'Europe/Copenhagen': 'Europe/Paris',
  'Europe/Madrid': 'Europe/Paris',
  'Europe/Oslo': 'Europe/Paris',
  'Europe/Rome': 'Europe/Paris',
  'Europe/Stockholm': 'Europe/Paris',
  'Europe/Vienna': 'Europe/Paris',
  'Europe/Warsaw': 'Europe/Paris',
  'America/Detroit': 'America/New_York',
  'America/Indiana/Indianapolis': 'America/New_York',
  'America/Toronto': 'America/New_York',
  'America/Winnipeg': 'America/Chicago',
  'America/Phoenix': 'America/Denver',
  'America/Vancouver': 'America/Los_Angeles',
  'Asia/Calcutta': 'Asia/Kolkata',
}

function timezone_offset_minutes(timezone: string): number | null {
  try {
    const date = new Date()
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date)
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
    const match = /^GMT(?:(?<sign>[+-])(?<hours>\d{1,2})(?::(?<minutes>\d{2}))?)?$/.exec(offset)
    if (!match?.groups) return null

    const sign = match.groups.sign === '-' ? -1 : 1
    const hours = Number(match.groups.hours ?? 0)
    const minutes = Number(match.groups.minutes ?? 0)
    return sign * (hours * 60 + minutes)
  } catch {
    return null
  }
}

export function get_browser_timezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export function closest_supported_timezone(timezone: string | null | undefined): string {
  if (!timezone) return 'UTC'
  if (SELECTABLE_TIMEZONE_VALUES.has(timezone)) return timezone
  if (TIMEZONE_ALIASES[timezone]) return TIMEZONE_ALIASES[timezone]

  const offset = timezone_offset_minutes(timezone)
  if (offset === null) return 'UTC'

  let closest = SELECTABLE_TIMEZONE_OPTIONS[0]?.value ?? 'UTC'
  let closestDistance = Number.POSITIVE_INFINITY

  for (const option of SELECTABLE_TIMEZONE_OPTIONS) {
    const optionOffset = timezone_offset_minutes(option.value)
    if (optionOffset === null) continue

    const distance = Math.abs(offset - optionOffset)
    if (distance < closestDistance) {
      closest = option.value
      closestDistance = distance
    }
  }

  return closest
}

export function display_timezone(timezone: string): string {
  return TIMEZONE_OPTIONS.find((option) => option.value === timezone)?.label ?? display_timezone(closest_supported_timezone(timezone))
}
