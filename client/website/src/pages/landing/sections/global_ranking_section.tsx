import { Percent, Trophy } from 'lucide-react'

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
          Hatrick shows your global rank, top percentage, and prediction ratios so your profile reflects both season position and pick accuracy.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:hidden">
          Track your global position, top percentage, and prediction ratios.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 border-y border-border/40 py-4 sm:mt-10 sm:max-w-xl sm:gap-5 sm:border-y-0 sm:py-0">
          {[
            { icon: Trophy, label: 'Global Rank', value: '#128' },
            { icon: Percent, label: 'Top Percentage', value: 'Top 18%' },
          ].map((item) => (
            <div key={item.label} className="px-2 py-1 text-center sm:border-y sm:border-border/40 sm:py-5">
              <item.icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 text-base font-medium sm:mt-3 sm:text-xl">{item.value}</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-muted-foreground/60 sm:text-[11px]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl border-t border-border/40 pt-8">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Prediction Ratios</p>
          <h3 className="mx-auto mt-3 max-w-xl text-2xl font-medium tracking-tight">Your profile shows which picks land most often</h3>
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
            Ratios separate outcome picks, both teams to score, scorer calls, and Hatricks so strong prediction habits are easy to scan.
          </p>
        </div>
      </div>
    </section>
  )
}
