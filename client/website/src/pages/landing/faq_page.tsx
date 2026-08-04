import { useEffect } from 'react'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

const sections = [
  {
    title: 'Is Hatrick gambling or betting?',
    body: 'No. Hatrick is not gambling, betting, a sportsbook, or a money based prediction product. There are no odds, deposits, withdrawals, wagers, cash out flows, or paid prediction markets. Predictions are made for football knowledge, points, ranks, and private league competition.',
  },
  {
    title: 'Is real money involved?',
    body: 'No real money is used for predictions or scoring. Hatrick does not let users stake money on matches, buy points, cash out points, or receive money based on a prediction result. The app is built around points, rankings, public profiles, and leagues between users.',
  },
  {
    title: 'What do I predict before a match starts?',
    body: 'For each open match, you can choose the winner or draw, whether both teams score, and one anytime scorer. Those three picks are simple on purpose. They keep the game easy to understand while still rewarding football knowledge, rosters, form, injuries, and match context.',
  },
  {
    title: 'When do predictions lock?',
    body: 'Predictions lock before the match starts. Once a match is locked, you can still open the match page, view the score, and follow synced match details, but you cannot edit that match prediction anymore.',
  },
  {
    title: 'Can I edit my prediction?',
    body: 'Yes, but only while the match is still open. You can change your outcome pick, both teams to score pick, and anytime scorer before the lock time. After the match locks, the saved prediction becomes final for scoring.',
  },
  {
    title: 'How are points calculated?',
    body: 'A correct winner or draw pick earns 10 points. A correct both teams to score pick earns 10 points. A correct anytime scorer earns 25 points. If all three picks are correct in the same match, Hatrick adds a 15 point bonus. The maximum score for one match is 60 points.',
  },
  {
    title: 'What counts as both teams to score?',
    body: 'Both teams to score is true when the final tracked score has at least one goal for each team. If either team finishes with zero goals, the correct both teams to score result is no.',
  },
  {
    title: 'Which goals count for anytime scorer?',
    body: 'Anytime scorer is settled from synced goal events. Normal goals and penalties count. Own goals and shootout penalties do not count for the anytime scorer pick because they do not represent the same scoring outcome inside Hatrick.',
  },
  {
    title: 'What happens if scorer data is limited?',
    body: 'Hatrick uses synced football data for teams and rosters. The scorer picker is based on the available roster for that team, so users can still choose a player without manually entering squad data. If provider data is delayed or corrected, available player lists may update after the next sync.',
  },
  {
    title: 'Do I need to provide teams or rosters manually?',
    body: 'No. Users do not need to insert teams, players, squads, logos, matches, scores, or goal events manually. Hatrick is designed so the backend syncs football data, stores it in the database, and the app reads from that stored data.',
  },
  {
    title: 'Why are there no matches today?',
    body: 'The matches page focuses on today. If no supported competition has synced matches for the current day, the app shows an empty state. New matches appear when the backend sync finds supported fixtures for today.',
  },
  {
    title: 'What happens if football data is delayed?',
    body: 'Football data can be delayed, missing, or corrected by the provider. Hatrick waits for reliable final data before settling points. This helps avoid early or wrong scoring when a match status, final score, scorer, or event feed changes later.',
  },
  {
    title: 'What happens if a match is postponed or cancelled?',
    body: 'If a match is postponed, cancelled, abandoned, or otherwise voided by the synced data, Hatrick should not award normal prediction points for that match. The goal is to keep scoring fair when the match was not completed in a usable way.',
  },
  {
    title: 'How do public profiles work?',
    body: 'Public profiles show a username, follower counts, following counts, prediction stats, ratios, global rank details, and prediction rank progress. Full names are only shown publicly when the user enables that option in account settings.',
  },
  {
    title: 'Can I change my username?',
    body: 'Yes, if the username is valid and available. Usernames must be 3 to 20 characters, use letters, numbers, and underscores, contain no spaces, avoid offensive wording, and stay unique without case sensitive duplicates. Username changes are limited so previous names remain reserved temporarily.',
  },
  {
    title: 'How does following work?',
    body: 'Following is public. You can follow or unfollow another public account, and other users can do the same with your account. Follower and following counts are shown publicly, and following does not create private access or a ranking advantage.',
  },
  {
    title: 'How do private leagues work?',
    body: 'Private leagues let users compete with a custom group. A host can create a league, choose allowed competitions, choose which prediction points count, set the period, choose player limits, and invite users directly inside the app. Members accept invitations in Hatrick and standings update from settled predictions.',
  },
  {
    title: 'What can a league host control?',
    body: 'A league host can manage league settings that are allowed by the app, pause or resume an active league, close a league when needed, and remove members except themselves. Finished leagues stay preserved for history and cannot be treated like temporary draft data.',
  },
  {
    title: 'What is the difference between global rank and league standings?',
    body: 'Global rank is based on long term settled Hatrick performance. League standings are based on the rules chosen for that specific league, such as competitions, scoring type, start date, and end date. A user can have strong global stats and still rank differently inside a league with custom rules.',
  },
  {
    title: 'What does Plus change?',
    body: 'Plus is an account plan shown on profiles with a small badge. Free users can host one active league with simple defaults. Plus users can host up to 20 active leagues and unlock league customization for competitions, scoring rules, and how late joiners start. Prediction scoring itself is not boosted by Plus.',
  },
  {
    title: 'Which competitions does Hatrick support?',
    body: 'Hatrick supports selected major competitions and leagues configured in the app, such as Champions League, Europa League, Conference League, Premier League, La Liga, Serie A, Bundesliga, and MLS. Availability depends on synced fixtures and provider coverage.',
  },
  {
    title: 'How should I make better predictions?',
    body: 'Use football knowledge instead of random picks. Check form, recent results, squad strength, injuries, rotations, team news, match importance, travel, and style matchups. Hatrick is designed to reward thoughtful football judgment, not rushed guessing.',
  },
]

export function FaqPage() {
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
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">FAQ</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                Clear answers about Hatrick
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                These answers explain how Hatrick predictions, points, profiles, ranks, leagues, usernames, and responsible prediction rules work in the current product.
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
