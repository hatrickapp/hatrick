import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

const sections = [
  {
    title: 'What information does Hatrick collect?',
    body: 'Hatrick collects the information needed to create and protect your account, run predictions, show rankings, and keep the app reliable. This may include your name, email address provided by Google or Apple, authentication provider, timezone, account status, trusted device records, session records, and basic device details. Hatrick also stores your username, username history controls, temporary username reservations, predictions, prediction revisions, points, match results, rank progress, public profile settings, follower and following relationships, and account activity timestamps.',
  },
  {
    title: 'What profile information is public?',
    body: 'Hatrick is built with public football profiles. Your username, profile picture if added, prediction rank, public ranking statistics, follower count, following count, followers list, and following list may be visible to other signed in users. Your full name is shown publicly only if you choose to enable the public name setting in your profile. Email address, trusted devices, session records, authentication details, and security information are not shown on public profiles.',
  },
  {
    title: 'How do user search and following work?',
    body: 'Signed in users may search public usernames and view public profiles. Search results may show a username, profile picture, and public name when the user has enabled public name visibility. Followers and following lists are public, searchable, and shown with pagination so users can browse accounts connected through the following system. Following another account does not require that account to follow back.',
  },
  {
    title: 'How do we use your information?',
    body: 'We use your information to create and manage your account, authenticate sign in with Google or Apple, update your profile, process predictions, lock predictions, calculate points, settle rankings, show ranking progress, operate public profiles, power user search, manage followers and following, prevent duplicate or abusive account activity, protect sessions, and improve the reliability of Hatrick. We may also use contact details to send important account, security, matchweek, or policy notices.',
  },
  {
    title: 'What app storage do we use?',
    body: 'Hatrick uses secure device storage for session tokens and trusted device tokens. The app may also cache app data for a faster interface, such as matchweek, ranking, prediction, league, and profile views. Clearing app storage may sign you out or remove cached app data.',
  },
  {
    title: 'How is information shared?',
    body: 'Hatrick does not sell personal data. Information is shared only when needed to operate the app, protect users, provide infrastructure, support Google or Apple authentication, process football data, support app purchases, comply with legal obligations, enforce terms, or prevent fraud and abuse.',
  },
  {
    title: 'How do we protect and retain data?',
    body: 'Hatrick uses security measures such as secure mobile token storage, trusted device controls, session expiration, provider based sign in, and access controls. No app can guarantee perfect security, but Hatrick is designed to reduce risk and limit unnecessary exposure. We retain account, prediction, ranking, public profile, follower, following, security, and operational records for as long as needed to provide the service, protect the app, resolve disputes, satisfy legal requirements, or maintain fair competition history.',
  },
  {
    title: 'What rights do you have?',
    body: 'You may access your account information, update your profile, manage trusted devices, and delete your account through the app where those features are available. You may also contact Hatrick to ask privacy questions or request help with your data. Requests are handled according to applicable law in Jordan and the information needed to verify the request.',
  },
  {
    title: 'How are policy changes handled?',
    body: 'Hatrick may update this Privacy Policy when the app, legal requirements, ranking system, prediction features, or service providers change. When updates are important, Hatrick may communicate them through the app, email, or another reasonable method. Continued use of Hatrick after the effective date means the updated policy applies.',
  },
  {
    title: 'How can you contact us?',
    body: 'For privacy questions, account requests, or data concerns, contact Hatrick at support@hatrick.app or by phone at + 962 79 2820 779. We may ask for information needed to verify your identity before acting on account or privacy requests.',
  },
]

export function PrivacyPolicyPage() {
  const location = useLocation()
  const backTo = (location.state as { from?: string } | null)?.from ?? ROUTES.LOGIN

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <main className="min-h-svh overflow-y-auto bg-background bg-dot-grid px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1rem)] text-foreground">
      <div className="mx-auto w-full max-w-md">
        <Button variant="ghost" asChild className="h-10 w-fit -ml-2 px-2 py-0 text-sm font-medium text-muted-foreground shadow-none">
          <Link to={backTo}>
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </Button>

        <article className="mt-7 space-y-8 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
          <header className="border-b border-border/40 pb-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Privacy Policy</p>
            <h1 className="mt-3 text-xl font-medium tracking-tight">How Hatrick protects and uses your information</h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Effective July 31, 2026. This Privacy Policy explains how Hatrick collects, uses, stores, protects, and shares information when you use the app.
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
