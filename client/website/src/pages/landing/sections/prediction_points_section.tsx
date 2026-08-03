import { predictionRules } from '../landing_data'

export function PredictionPointsSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-b border-border/40">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">How points work</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight">Simple picks, serious scoring</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Each match has three simple choices, and every correct answer moves your total forward
          </p>
          </div>
          <div className="mt-8 divide-y divide-border/30 border-y border-border/40">
            {predictionRules.map((rule) => (
              <div key={rule.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5">
                <div>
                  <p className="text-sm font-medium">{rule.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Example: {rule.example}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium text-primary">{rule.points}</p>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
