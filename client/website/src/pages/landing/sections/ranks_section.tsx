import { ranks } from '../landing_data'

function RankMilestone({
  rank,
  index,
}: {
  rank: (typeof ranks)[number]
  index: number
}) {
  const Icon = rank.icon

  return (
    <div className="relative flex min-h-[7.75rem] flex-col justify-between border-t border-border/35 px-2 py-4 sm:min-h-[8.75rem] sm:px-3 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/45 sm:text-[11px]">
            Rank {index + 1}
          </p>
          <p className="mt-2 text-sm font-medium leading-tight sm:text-base">{rank.name}</p>
        </div>
        <Icon className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" style={{ color: rank.color }} />
      </div>
      <div>
        <p className="text-lg font-medium leading-none sm:text-2xl" style={{ color: rank.color }}>
          {rank.points.toLocaleString()}
        </p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground/55">settled points</p>
      </div>
    </div>
  )
}

export function RanksSection() {
  return (
    <section id="ranks" className="scroll-mt-24 border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Ranks</p>
            <h2 className="mt-3 text-3xl font-medium leading-tight">Every point moves your season</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Build from Bronze to Hall of Fame through settled predictions, correct scorers, and matchweek consistency.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4 sm:gap-x-8 lg:gap-x-10">
            {ranks.map((rank, index) => (
              <RankMilestone key={rank.name} rank={rank} index={index} />
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xs text-center text-xs leading-5 text-muted-foreground/55 sm:max-w-md sm:text-sm sm:leading-6">
            Each tier unlocks through total settled points, so every correct pick moves your season forward.
          </p>
        </div>
      </div>
    </section>
  )
}
