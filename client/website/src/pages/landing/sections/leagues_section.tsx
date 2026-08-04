import { Shield, SlidersHorizontal, UsersRound } from 'lucide-react'
import { competition_logo_image_class } from '@/lib/competition_logo'
import { cn } from '@/lib/utils'
import { competitions } from '../landing_data'

const leagueFeatures = [
  {
    icon: Shield,
    label: 'In-app invitations',
    text: 'Create a league, search a username, and invite players directly inside Hatrick',
  },
  {
    icon: SlidersHorizontal,
    label: 'Custom scoring',
    text: 'Choose which prediction types count, from winner picks to full Hatrick scoring',
  },
  {
    icon: UsersRound,
    label: 'Live standings',
    text: 'Track members as settled matches update points, Hatricks, and scorer results',
  },
]

const previewCompetitions = ['Premier League', 'La Liga', 'MLS', 'Champions League']
  .map((name) => competitions.find((competition) => competition.name === name))
  .filter((competition): competition is { name: string; logo: string } => Boolean(competition))

const previewStandings = [
  { rank: 1, username: 'yousefball', name: 'Yousef Bustami', points: 184 },
  { rank: 2, username: 'finalthird', name: 'Omar Haddad', points: 171 },
  { rank: 3, username: 'matchreader', name: 'Dana Saleh', points: 158 },
  { rank: 4, username: 'pressmonster', name: 'Karim Nasser', points: 142 },
  { rank: 5, username: 'boxrunner', name: 'Lina Mansour', points: 136 },
]

export function LeaguesSection() {
  return (
    <section id="leagues" className="border-b border-border/40">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Leagues</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-medium leading-tight tracking-tight sm:text-3xl">Build a table for any football circle</h2>
        <p className="mx-auto mt-4 hidden max-w-2xl text-sm leading-7 text-muted-foreground sm:block">
          Hatrick leagues let friends, classrooms, offices, and football groups run their own prediction table with controlled competitions, scoring rules, and standings
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:hidden">
          Create private leagues with custom scoring and live standings
        </p>

        <div className="mx-auto mt-7 grid max-w-md grid-cols-3 border-y border-border/40 py-4 sm:hidden">
          {leagueFeatures.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 px-2">
              <item.icon className="h-5 w-5 text-primary" />
              <p className="text-[13px] font-medium leading-4">
                {item.label === 'In-app invitations' ? 'In-app invites' : item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 hidden max-w-4xl gap-5 sm:grid sm:grid-cols-3">
          {leagueFeatures.map((item) => (
            <div key={item.label} className="border-y border-border/40 py-5 text-center">
              <item.icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">{item.label}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground/70">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-7 max-w-2xl border-t border-border/40 pt-6 text-left sm:mt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-medium tracking-tight">My League</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Active · 5 / 20 players</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-medium text-primary">#3</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/60">My Rank</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-border/30 py-4">
            {previewCompetitions.map((competition) => (
              <span key={competition.name} className="inline-flex items-center gap-2 text-xs font-medium">
                <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden">
                  <img src={competition.logo} alt={competition.name} className={cn('h-5 w-5 object-contain', competition_logo_image_class(competition.name))} loading="lazy" />
                </span>
                <span>{competition.name}</span>
              </span>
            ))}
          </div>

          <div className="divide-y divide-border/30">
            {previewStandings.map((player) => (
              <div key={player.username} className="grid grid-cols-[36px_minmax(0,1fr)_56px] items-center gap-3 py-3">
                <p className="text-xs font-medium text-muted-foreground">#{player.rank}</p>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">@{player.username}</p>
                  <p className="truncate text-xs text-muted-foreground/60">{player.name}</p>
                </div>
                <p className="text-right text-sm font-medium text-primary">{player.points}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
