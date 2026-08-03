import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

const sections = [
  {
    title: 'Why did we build Hatrick?',
    body: 'We built Hatrick because football weeks already have the perfect rhythm for competition. Fixtures arrive, conversations start, fans compare opinions, and every match creates a chance to be right before the ball is kicked. Hatrick gives that energy a proper home. Instead of scattered guesses in group chats, players get one clean place to make picks, track outcomes, earn points, and follow their progress across the matchweek.',
  },
  {
    title: 'What makes the game simple?',
    body: 'The prediction format is intentionally clear. For each match, you choose the winner or draw, whether both teams score, and one anytime goal scorer. That is enough to make every match feel meaningful without turning the app into something complicated. The rules are easy to understand, but the choices still reward football knowledge, roster awareness, form, injuries, momentum, and the ability to stay objective when your favorite team is involved.',
  },
  {
    title: 'How should Hatrick feel?',
    body: 'Hatrick should feel calm, fast, and focused. The product is built around matches, predictions, points, ranks, and permanent progress, without unnecessary clutter around the experience. Players should be able to open the app, understand the matchweek, make their picks, and check their ranking without friction. The goal is to make football prediction feel organized and modern while still keeping the tension, bragging rights, and weekly excitement that make the sport special.',
  },
]

export function AboutPage() {
  return (
    <div className="dotted-background min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <article className="space-y-10">
          <header className="space-y-5 border-b border-border/40 pb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">About us</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                Hatrick makes every matchweek matter
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                We are building a football prediction experience for fans who want clear picks, fair points, weekly competition, and a ranking that feels alive throughout the season. Hatrick is made for people who watch matches closely, talk football constantly, and want their opinions to count in a simple and structured way.
              </p>
            </div>
          </header>

          {sections.map((section, index) => (
            <section key={section.title} className={index === 0 ? 'pt-0' : 'border-t border-border/40 pt-8'}>
              <h2 className="text-xl font-medium tracking-tight">{section.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <LandingFooter />
    </div>
  )
}
