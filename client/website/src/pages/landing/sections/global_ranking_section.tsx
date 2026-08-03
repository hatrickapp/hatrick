import { BarChart3, Target, Trophy } from 'lucide-react'

const predictionRatioExample = [
  { label: 'Winner / Draw', correct: 214, total: 360, percent: 59 },
  { label: 'BTTS', correct: 238, total: 310, percent: 77 },
  { label: 'Scorer', correct: 92, total: 285, percent: 32 },
  { label: 'Hatrick', correct: 48, total: 260, percent: 18 },
]

export function GlobalRankingSection() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Global Ranking</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium tracking-tight">Every settled point moves your position</h2>
        <p className="mx-auto mt-4 hidden max-w-2xl text-sm leading-7 text-muted-foreground sm:block">
          Hatrick ranks every player forever using settled points first, Hatricks second, and correct scorers third. Your page shows your global rank, top percentage, best rank reached, and the next milestone ahead.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:hidden">
          Track your global position, top percentage, and next milestone
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 border-y border-border/40 py-4 sm:mt-10 sm:max-w-3xl sm:gap-5 sm:border-y-0 sm:py-0">
          {[
            { icon: Trophy, label: 'Global Rank', value: '#128' },
            { icon: BarChart3, label: 'Top Percentage', value: 'Top 18%' },
            { icon: Target, label: 'Next Milestone', value: 'Top 10%' },
          ].map((item) => (
            <div key={item.label} className="px-2 py-1 text-center sm:border-y sm:border-border/40 sm:py-5">
              <item.icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 text-base font-medium sm:mt-3 sm:text-xl">{item.value}</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-muted-foreground/60 sm:text-[11px]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Distance to Top 10%</span>
            <span className="font-medium text-primary">82%</span>
          </div>
          <div className="mt-3 h-2 bg-border/50">
            <div className="h-full bg-primary" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl border-t border-border/40 pt-8">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Prediction Ratios</p>
          <h3 className="mx-auto mt-3 max-w-xl text-2xl font-medium tracking-tight">Hundreds of picks show your strongest pattern</h3>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {predictionRatioExample.map((item) => (
              <div key={item.label} className="flex min-w-0 flex-col items-center border-t border-border/30 pt-5">
                <p className="text-lg font-medium text-primary tabular-nums">{item.percent}%</p>
                <div className="mt-4 flex h-40 items-end">
                  <div className="flex h-full w-6 items-end bg-border/50 sm:w-8">
                    <div className="w-full bg-primary" style={{ height: `${item.percent}%` }} />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-medium leading-5">{item.label}</p>
                <p className="mt-1 text-center text-xs text-muted-foreground/60">
                  {item.correct} / {item.total} correct
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
            In this sample, BTTS is the strongest pick type because it landed 238 correct predictions from 310 locked picks.
          </p>
        </div>
      </div>
    </section>
  )
}
