import { useEffect } from 'react'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

type SeoArticlePageProps = {
  eyebrow: string
  title: string
  intro: string
  sections: {
    title: string
    body: string
  }[]
}

export function SeoArticlePage({ eyebrow, title, intro, sections }: SeoArticlePageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="dotted-background min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <article className="space-y-10">
          <header className="space-y-5 border-b border-border/40 pb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">{eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                {intro}
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

export function FootballPredictionGamePage() {
  return (
    <SeoArticlePage
      eyebrow="Football prediction game"
      title="A football prediction game built for every matchweek"
      intro="Hatrick gives football fans a simple way to predict matches, earn points, climb ranks, and compete with friends without betting, odds, deposits, or wagers."
      sections={[
        {
          title: 'Predict the moments that matter',
          body: 'Each match focuses on clear football predictions: the match winner or draw, whether both teams score, and one anytime scorer. The format is easy to understand, but it still rewards fans who follow form, injuries, lineups, team news, tactics, and match context.',
        },
        {
          title: 'Earn points from football knowledge',
          body: 'Hatrick turns correct predictions into points and ranking progress. Winner or draw picks, both teams to score picks, anytime scorer picks, and the Hatrick bonus give every fixture a reason to watch closely.',
        },
        {
          title: 'Compete without gambling',
          body: 'Hatrick is a points based football prediction app, not a betting product. There are no odds, cash outs, deposits, withdrawals, stakes, or money based prediction markets. The competition is built around knowledge, timing, ranks, and private leagues.',
        },
      ]}
    />
  )
}

export function PrivateFootballLeaguesPage() {
  return (
    <SeoArticlePage
      eyebrow="Private football leagues"
      title="Create private football prediction leagues with friends"
      intro="Hatrick private leagues let football groups run their own prediction table with in-app invitations, custom scoring, supported competitions, and live standings."
      sections={[
        {
          title: 'Built for football circles',
          body: 'Private leagues are made for friends, classrooms, offices, group chats, and football communities that want one clean table for matchweek predictions. Hosts invite users inside the app, and members compete through settled points.',
        },
        {
          title: 'Control the league format',
          body: 'League creators can choose competitions, scoring options, member limits, and rules that fit their group. That keeps casual leagues simple while giving serious prediction groups more control through Hatrick Plus.',
        },
        {
          title: 'Follow standings as matches settle',
          body: 'As football results and scorer events are settled, league standings update around points, Hatricks, scorer picks, and ranking movement. The goal is to make every matchweek feel organized, competitive, and easy to follow.',
        },
      ]}
    />
  )
}

export function FootballPredictionRulesPage() {
  return (
    <SeoArticlePage
      eyebrow="Football prediction rules"
      title="Football prediction rules, points, and scoring in Hatrick"
      intro="Hatrick keeps football prediction rules simple: pick the match outcome, both teams to score, and an anytime scorer before the match locks."
      sections={[
        {
          title: 'Three prediction choices per match',
          body: 'For every open fixture, users can choose the winner or draw, whether both teams score, and one anytime scorer. Predictions can be edited before lock time, then become final when the match starts.',
        },
        {
          title: 'Simple points with a Hatrick bonus',
          body: 'A correct winner or draw pick earns 10 points, a correct both teams to score pick earns 10 points, and a correct anytime scorer earns 25 points. Getting all three choices correct in the same match adds a 15 point Hatrick bonus.',
        },
        {
          title: 'Fair settlement after full time',
          body: 'Hatrick waits for synced football data before settling scores, goal events, and prediction points. This helps keep rankings fair when football data is delayed, corrected, postponed, or incomplete.',
        },
      ]}
    />
  )
}
