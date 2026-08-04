import { ranks } from '../landing_data'
import { cn } from '@/lib/utils'

function CurvedArrow({ direction }: { direction: 'right' | 'left' }) {
  return (
    <div className={cn('flex h-7 -translate-y-3 items-center sm:h-8 sm:-translate-y-5', direction === 'right' ? 'justify-start pl-10 sm:pl-14' : 'justify-end pr-10 sm:pr-14')}>
      <svg
        viewBox="0 0 260 58"
        aria-hidden="true"
        className={cn('h-8 w-[66%] text-foreground sm:h-10 sm:w-[72%]', direction === 'left' && '-scale-x-100')}
      >
        <path
          d="M28 12 C 94 0, 178 12, 230 46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <path
          d="M220 45 L230 46 L226 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function MobileRankCard({
  rank,
  index,
}: {
  rank: (typeof ranks)[number]
  index: number
}) {
  const Icon = rank.icon

  return (
    <div className="relative flex min-h-[8.5rem] flex-col justify-between border border-border/45 bg-background px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/45">
            Rank {index + 1}
          </p>
          <p className="mt-2 text-sm font-medium leading-tight">{rank.name}</p>
        </div>
        <Icon className="h-9 w-9 shrink-0" style={{ color: rank.color }} />
      </div>
      <div>
        <p className="text-lg font-medium leading-none" style={{ color: rank.color }}>
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

        <div className="mt-8 sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            {ranks.map((rank, index) => (
              <MobileRankCard key={rank.name} rank={rank} index={index} />
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xs text-center text-xs leading-5 text-muted-foreground/55">
            Each tier unlocks through total settled points, so every correct pick moves your season forward.
          </p>
        </div>

        <div className="mx-auto mt-9 hidden max-w-xl border-y border-border/40 py-5 sm:block">
          {ranks.map((rank, index) => {
            const Icon = rank.icon
            const side = index % 2 === 0 ? 'left' : 'right'
            return (
              <div key={rank.name}>
                <div className={cn('flex', side === 'left' ? 'justify-start' : 'justify-end')}>
                  <div className={cn('flex min-w-[9.5rem] items-center gap-3 py-1.5 sm:min-w-[12rem] sm:gap-4', side === 'right' && 'flex-row-reverse text-right')}>
                    <Icon className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" style={{ color: rank.color }} />
                    <div>
                      <p className="text-[13px] font-medium sm:text-sm">{rank.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60 sm:text-xs">{rank.points.toLocaleString()} points</p>
                    </div>
                  </div>
                </div>
                {index < ranks.length - 1 && (
                  <CurvedArrow direction={side === 'left' ? 'right' : 'left'} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
