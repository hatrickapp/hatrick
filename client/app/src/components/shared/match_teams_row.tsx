import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { MatchListItem } from '@/types/sports_types'

function team_logo(src: string | null, name: string, className = 'h-6 w-6') {
  if (!src) return <span className={cn('shrink-0 rounded-full bg-primary/10', className)} />
  return <img src={src} alt={name} className={cn('shrink-0 object-contain', className)} loading="lazy" />
}

function compact_team_name(name: string) {
  const maxLength = 16
  if (name.length <= maxLength) return name

  const words = name.split(/\s+/).filter(Boolean)
  if (words.length === 0) return name
  if (words.length === 1) return `${words[0].slice(0, maxLength - 1)}.`

  if (words.length >= 3) {
    const candidate = `${words[0]} ${words[1]} ${words[2].slice(0, 2)}.`
    if (candidate.length <= maxLength + 2) return candidate
  }

  const first = words[0]
  const second = words[1]
  const secondLength = Math.max(2, maxLength - first.length - 2)
  return `${first} ${second.slice(0, secondLength)}.`
}

export function MatchTeamsRow({ match, center }: { match: MatchListItem; center: ReactNode }) {
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right sm:gap-2">
        <span className="line-clamp-1 text-xs font-medium leading-[1.25] sm:text-sm sm:leading-5" title={match.home_team.name}>
          {compact_team_name(match.home_team.name)}
        </span>
        {team_logo(match.home_team.logo_url, match.home_team.name)}
      </div>
      <div className="w-[4.6rem] shrink-0 text-center text-xs font-medium sm:w-24 sm:text-sm">{center}</div>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        {team_logo(match.away_team.logo_url, match.away_team.name)}
        <span className="line-clamp-1 text-xs font-medium leading-[1.25] sm:text-sm sm:leading-5" title={match.away_team.name}>
          {compact_team_name(match.away_team.name)}
        </span>
      </div>
    </>
  )
}
