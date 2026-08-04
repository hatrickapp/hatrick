import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { ROUTES } from '@/lib/constants'

const sections = [
  {
    title: 'What do you accept by using Hatrick?',
    body: 'By creating an account, signing in, making predictions, viewing matchweeks, or otherwise using Hatrick, you agree to these Terms of Service. If you do not agree, you should not use Hatrick. These Terms apply from the effective date shown above and are intended to operate under applicable laws in Jordan.',
  },
  {
    title: 'Who can use Hatrick?',
    body: 'You must be old enough to use Hatrick and participate responsibly under applicable law. You must provide accurate account information, keep your details current, and use only one account for yourself. Hatrick may refuse, suspend, or remove accounts that provide false information, violate these Terms, abuse the app, or create unfair competition.',
  },
  {
    title: 'How do user accounts work?',
    body: 'You can create or access an account using Google or Apple sign in. You are responsible for protecting your sessions and account access. You must choose and maintain a username that is accurate, lawful, not offensive, not abusive, not misleading, and not intended to impersonate another person or brand. If you believe your account has been accessed without permission, contact Hatrick promptly.',
  },
  {
    title: 'How do public profiles work?',
    body: 'Hatrick usernames, profile pictures if added, ranking statistics, prediction statistics, follower counts, following counts, followers lists, and following lists are public to signed in users. Your full name is public only if you enable public name visibility in your profile.',
  },
  {
    title: 'What is Hatrick?',
    body: 'Hatrick is a football prediction platform built around matchweek competitions. Users predict match outcomes, both teams to score, and anytime goal scorers before matches lock. The app calculates points, ranks users, and shows permanent ranking progress. Hatrick is for entertainment, skill based competition, and fan engagement. It is not a gambling service, betting product, sportsbook, financial product, or money based prediction platform.',
  },
  {
    title: 'How do predictions work?',
    body: 'For each match, you may choose the winner or draw, whether both teams score, and one anytime scorer. You may edit a prediction while the match is still open. Predictions lock before kickoff according to the app rules and cannot be changed after they lock. If you miss a prediction before lock time, you will not receive points for that match.',
  },
  {
    title: 'How are points and rankings calculated?',
    body: 'A correct winner or draw pick is worth 10 points. A correct both teams to score pick is worth 10 points. A correct anytime scorer is worth 25 points. Getting all three prediction choices correct for one match earns a 15 point Hatrick bonus. The maximum score for one match is 60 points. Global ranking is based on total settled points.',
  },
  {
    title: 'What use is not allowed?',
    body: 'You may not cheat, use bots, scrape the service, create fake accounts, reserve or rotate usernames abusively, exploit bugs, manipulate rankings, attack the app, interfere with other users, harass anyone, submit abusive content, bypass security, misuse public profiles or following lists, or use Hatrick in a way that violates law or harms the service.',
  },
  {
    title: 'Which outside services are involved?',
    body: 'Hatrick may use outside services for football data, hosting, database infrastructure, Google or Apple authentication, in app purchases, and operational support. Outside services may have their own terms and privacy practices.',
  },
  {
    title: 'What disclaimers apply?',
    body: 'Hatrick is provided on an as available basis. Football data may be delayed, incomplete, corrected, or inaccurate. Match statuses, scores, goals, player data, match events, and final results may depend on provider coverage and later corrections. Hatrick does not guarantee uninterrupted access or error free operation.',
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
  const location = useLocation()
  const backTo = (location.state as { from?: string } | null)?.from ?? ROUTES.LOGIN

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <main className="min-h-svh overflow-y-auto bg-background bg-dot-grid px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1rem)] text-foreground">
      <div className="mx-auto w-full max-w-md">
        <BackIconButton to={backTo} className="-ml-2" />

        <article className="mt-7 space-y-8 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
          <header className="border-b border-border/40 pb-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Terms of Service</p>
            <h1 className="mt-3 text-xl font-medium tracking-tight">The rules for using Hatrick</h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Effective July 31, 2026. These Terms explain how Hatrick accounts, predictions, points, rankings, and acceptable use work.
            </p>
          </header>

          {sections.map((section, index) => (
            <section key={section.title} className={index === 0 ? 'pt-0' : 'border-t border-border/40 pt-7'}>
              <h2 className="text-base font-medium tracking-tight">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </article>
      </div>
    </main>
  )
}
