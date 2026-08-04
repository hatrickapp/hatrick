import { useEffect } from 'react'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

const sections = [
  {
    title: 'What do you accept by using Hatrick?',
    body: 'By creating an account, signing in, making predictions, viewing matchweeks, or otherwise using Hatrick, you agree to these Terms of Service. If you do not agree, you should not use Hatrick. These Terms apply from the effective date shown above and are intended to operate under applicable laws in Jordan.',
  },
  {
    title: 'Who can use Hatrick?',
    body: 'You must be old enough to use an online account service and participate responsibly under applicable law. You must provide accurate account information, keep your details current, and use only one account for yourself. Hatrick may refuse, suspend, or remove accounts that provide false information, violate these Terms, abuse the app, or create unfair competition.',
  },
  {
    title: 'How do user accounts work?',
    body: 'You can create an account using email and password or an available authentication provider. You are responsible for protecting your login credentials, devices, sessions, and account access. You must choose and maintain a username that is accurate, lawful, not offensive, not abusive, not misleading, and not intended to impersonate another person or brand. If you believe your account has been accessed without permission, contact Hatrick promptly. Hatrick may suspend or remove accounts where needed to protect users, rankings, security, or the integrity of the service.',
  },
  {
    title: 'How do public profiles work?',
    body: 'Hatrick usernames, full names, ranking statistics, prediction statistics, follower counts, following counts, followers lists, and following lists are public to signed in users. Public profile features are part of the Hatrick experience and allow users to search accounts, view prediction progress, and follow other users.',
  },
  {
    title: 'How does following work?',
    body: 'Users may follow and unfollow public accounts. Following another user does not require that user to follow back and does not create any private relationship, messaging right, reward, ranking advantage, or special access. You may not use following, user search, profile visibility, or public account information to harass users, spam accounts, impersonate others, manipulate rankings, scrape the service, or otherwise abuse Hatrick.',
  },
  {
    title: 'What is Hatrick?',
    body: 'Hatrick is a football prediction platform built around matchweek competitions. Users predict match outcomes, both teams to score, and anytime goal scorers before matches lock. The app calculates points, ranks users, and shows permanent ranking progress. Hatrick is for entertainment, skill based competition, and fan engagement. It is not a gambling service, betting product, sportsbook, financial product, or money based prediction platform.',
  },
  {
    title: 'Responsible predictions and not gambling',
    body: 'Hatrick does not offer gambling, betting, wagers, deposits, withdrawals, odds, cash out flows, or money based prediction activity. Predictions are made for points, ranking, and football knowledge only. Users should make picks calmly, use football context such as form, injuries, team news, and match importance, and avoid treating predictions as financial advice or a way to make money. If the experience ever stops feeling enjoyable, users should take a break and return only when they want to participate responsibly.',
  },
  {
    title: 'How do predictions work?',
    body: 'For each match, you may choose the winner or draw, whether both teams score, and one anytime scorer. You may edit a prediction while the match is still open. Predictions lock before kickoff according to the app rules and cannot be changed after they lock. If you miss a prediction before lock time, you will not receive points for that match. Delays, data corrections, postponed matches, canceled matches, or voided matches may affect what is shown or settled.',
  },
  {
    title: 'How are points and rankings calculated?',
    body: 'A correct winner or draw pick is worth 10 points. A correct both teams to score pick is worth 10 points. A correct anytime scorer is worth 25 points. Getting all three prediction choices correct for one match earns a 15 point Hatrick bonus. The maximum score for one match is 60 points. Global ranking is based on total settled points. Current tie order is total points, then Hatricks, then correct scorers, then account creation order and user id for a deterministic result.',
  },
  {
    title: 'How do ranks work?',
    body: 'Hatrick ranks are based on total settled points. Rank levels may include Bronze, Silver, Gold, Platinum, All Star, Hatrick Hero, Legend, and Hall of Fame. Rank thresholds may be shown in the app and may change if Hatrick updates the ranking system. Rank progress is informational and purely point based.',
  },
  {
    title: 'What use is not allowed?',
    body: 'You may not cheat, use bots, scrape the service, create fake accounts, reserve or rotate usernames abusively, exploit bugs, manipulate rankings, attack the app, interfere with other users, harass anyone, submit abusive content, bypass security, misuse public profiles or following lists, or use Hatrick in a way that violates law or harms the service. You must report serious bugs or scoring issues instead of exploiting them. Hatrick may reverse points, void predictions, remove follows, restrict public visibility, suspend accounts, or take other action when abuse is detected.',
  },
  {
    title: 'How does voluntary support work?',
    body: 'Hatrick may offer voluntary support options through crypto wallet addresses. Support is optional and does not buy points, predictions, rank position, account privileges, special treatment, prizes, or any competitive advantage. Crypto transfers may be irreversible and take place on public blockchain networks. Users are responsible for checking the selected network and wallet address before sending support.',
  },
  {
    title: 'Who owns Hatrick content and software?',
    body: 'Hatrick owns or controls the Hatrick name, logo, design, interface, software, copy, ranking presentation, and original app content, except for content owned by users, licensors, or service providers. You may not copy, modify, sell, distribute, reverse engineer, or misuse Hatrick software, branding, or content without permission. Football data, team marks, and league marks may belong to their respective owners.',
  },
  {
    title: 'Which outside services are involved?',
    body: 'Hatrick may use outside services for football data, hosting, database infrastructure, email delivery, authentication options, and operational support. Football data may come from API Football by API Sports. Authentication is handled through Hatrick account code and database infrastructure, with optional outside providers only when available and chosen. Outside services may have their own terms and privacy practices.',
  },
  {
    title: 'What disclaimers apply?',
    body: 'Hatrick is provided on an as available basis. Football data may be delayed, incomplete, corrected, or inaccurate. Match statuses, scores, goals, player data, match events, and final results may depend on provider coverage and later corrections. Hatrick does not guarantee uninterrupted access, error free operation, or that every match will have complete provider data. To the extent permitted by applicable law, Hatrick limits liability for indirect loss, data delays, scoring corrections, and service interruptions.',
  },
  {
    title: 'How can these Terms change?',
    body: 'Hatrick may update these Terms when the app, ranking system, prediction features, legal requirements, or service providers change. Important updates may be communicated through the app, email, or another reasonable method. Continued use of Hatrick after an update means you accept the updated Terms.',
  },
  {
    title: 'How can you contact us?',
    body: 'For Terms questions, account issues, or support requests, contact Hatrick at support@hatrick.app. Hatrick may ask for information needed to verify your account before acting on account or legal requests.',
  },
]

export function TermsOfServicePage() {
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
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Terms of Service</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                The rules for using Hatrick
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                Effective July 17, 2026. These Terms explain how Hatrick accounts, predictions, points, rankings, and acceptable use work. They are written for the current Hatrick product and should be read together with the Privacy Policy.
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
