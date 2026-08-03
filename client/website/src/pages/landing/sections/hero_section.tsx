import { CheckCircle2 } from 'lucide-react'
import logoSrc from '@/assets/logo.png'
import { competition_logo_image_class } from '@/lib/competition_logo'
import { cn } from '@/lib/utils'
import { competitions } from '../landing_data'
import { MobileStoreBadge } from './mobile_store_badge'

export function HeroSection() {
  const featured = competitions

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-9 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <img
            src={logoSrc}
            alt="Hatrick"
            className="mx-auto h-24 w-24 object-contain sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            loading="eager"
            decoding="async"
          />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Football predictions for every matchweek
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-medium leading-[1.14] tracking-[0.01em] sm:text-4xl lg:text-5xl">
            Football prediction game for every matchweek
          </h1>
          <p className="mx-auto mt-5 hidden max-w-2xl text-base leading-8 text-muted-foreground sm:block">
            Hatrick turns weekly football fixtures into a clean prediction app with match winners, both teams to score, anytime scorers, points, ranks, and private football leagues.
          </p>
          <p className="mx-auto mt-5 max-w-[20.5rem] text-sm leading-7 text-muted-foreground sm:hidden">
            Pick winners, BTTS, and scorers in a clean football prediction game. Earn points and climb.
          </p>
          <div className="mt-7 flex justify-center">
            <MobileStoreBadge />
          </div>
          <div className="mt-9 hidden grid-cols-3 gap-2 border-y border-border/40 py-5 text-[11px] sm:grid sm:gap-4 sm:text-sm">
            {['Locks before kickoff', 'Settles after full time', 'Tracks points and ranks'].map((item) => (
              <div key={item} className="flex min-w-0 items-center justify-center gap-1.5 text-muted-foreground sm:gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                <span className="leading-4">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-9 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60 sm:hidden">
            Supported competitions across Hatrick
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 sm:mt-6">
            {featured.map((competition) => (
              <img
                key={competition.name}
                src={competition.logo}
                alt={competition.name}
                className={cn('h-9 w-9 object-contain', competition_logo_image_class(competition.name))}
                loading="eager"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
