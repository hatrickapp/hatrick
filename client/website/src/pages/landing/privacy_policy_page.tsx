import { useEffect } from 'react'
import { LandingFooter } from './sections/landing_footer'
import { LandingNav } from './sections/landing_nav'

const sections = [
  {
    title: 'What information does Hatrick collect?',
    body: 'Hatrick collects the information needed to create and protect your account, run predictions, show rankings, and keep the app reliable. This may include your name, email address provided by Google or Apple, authentication provider, timezone, account status, session records, and basic request details. Hatrick also stores your username, username history controls, temporary username reservations, predictions, prediction revisions, points, match results, rank progress, public profile settings, follower and following relationships, and account activity timestamps.',
  },
  {
    title: 'What profile information is public?',
    body: 'Hatrick is built with public football profiles. Your username, prediction rank, public ranking statistics, prediction accuracy information, follower count, following count, followers list, and following list may be visible to other signed in users. Your full name is shown publicly only if you choose to enable the public name setting in your profile. Email address, session records, authentication details, and security information are not shown on public profiles.',
  },
  {
    title: 'How do user search and following work?',
    body: 'Signed in users may search public usernames and view public profiles. Search results may show a username and public name when the user has enabled public name visibility. Followers and following lists are public, searchable, and shown with pagination so users can browse accounts connected through the following system. Following another account does not require that account to follow back.',
  },
  {
    title: 'How do we use your information?',
    body: 'We use your information to create and manage your account, authenticate sign in with Google or Apple, update your profile, process predictions, lock predictions, calculate points, settle rankings, show ranking progress, operate public profiles, power user search, manage followers and following, prevent duplicate or abusive account activity, protect sessions, and improve the reliability of Hatrick. We may also use contact details to send important account, security, matchweek, or policy notices.',
  },
  {
    title: 'How does responsible prediction content work?',
    body: 'Hatrick may show guidance about responsible predictions, football research, prediction lock timing, and point based competition. This content is part of the app experience and does not involve outside advertisers, paid betting products, or money based prediction activity.',
  },
  {
    title: 'What cookies and storage do we use?',
    body: 'Hatrick uses session cookies and secure app storage to keep you signed in and manage authentication. The app may also use local storage to cache app data for a faster interface, such as matchweek, ranking, prediction, and profile views. These technologies help the app feel responsive and reduce unnecessary server calls. You can clear browser storage or cookies, but doing so may sign you out or remove cached app data.',
  },
  {
    title: 'How does voluntary support work?',
    body: 'Hatrick may provide a Support Us page with optional crypto wallet addresses. Hatrick does not currently process support payments inside the app or use an in app payment processor for support. Crypto transfers happen on public blockchain networks and may be visible through those networks. They are handled by the selected blockchain network and wallet software, not by Hatrick app payment infrastructure.',
  },
  {
    title: 'Which outside services support Hatrick?',
    body: 'Hatrick may rely on outside infrastructure and service providers for hosting, database storage, email delivery, authentication options, football data, security, and operational reliability. Football fixtures, teams, player data, match events, scores, and final results may come from API Football by API Sports. Optional sign in providers such as Google or GitHub may be used only when you choose them. Voluntary support transfers may involve blockchain networks outside Hatrick.',
  },
  {
    title: 'How is information shared?',
    body: 'Hatrick does not sell personal data. Information is shared only when needed to operate the app, protect users, provide infrastructure, deliver authentication or email services, process football data, comply with legal obligations, enforce terms, or prevent fraud and abuse.',
  },
  {
    title: 'How do we protect and retain data?',
    body: 'Hatrick uses security measures such as encrypted email storage, hashed email lookup, secure authentication cookies, secure mobile token storage, session expiration, provider based sign in, and access controls. No online service can guarantee perfect security, but Hatrick is designed to reduce risk and limit unnecessary exposure. We retain account, prediction, ranking, public profile, follower, following, security, and operational records for as long as needed to provide the service, protect the app, resolve disputes, satisfy legal requirements, or maintain fair competition history. Previous usernames may be reserved temporarily for account integrity and abuse prevention.',
  },
  {
    title: 'What rights do you have?',
    body: 'You may access your account information, update your profile, review active sessions, and delete your account through the app where those features are available. You may also contact Hatrick to ask privacy questions or request help with your data. Requests are handled according to applicable law in Jordan and the information needed to verify the request.',
  },
  {
    title: 'How do we handle children privacy?',
    body: 'Hatrick is not intended for children below the minimum age required by applicable law. Users must be old enough to create an account, understand these terms, and participate responsibly. Hatrick does not knowingly collect personal information from children below the required age. If we learn that such information was collected, we will take appropriate steps to remove it or close the account.',
  },
  {
    title: 'How are policy changes handled?',
    body: 'Hatrick may update this Privacy Policy when the app, legal requirements, ranking system, prediction features, or service providers change. When updates are important, Hatrick may communicate them through the app, email, or another reasonable method. Continued use of Hatrick after the effective date means the updated policy applies.',
  },
  {
    title: 'How can you contact us?',
    body: 'For privacy questions, account requests, or data concerns, contact Hatrick at support@hatrick.app. We may ask for information needed to verify your identity before acting on account or privacy requests.',
  },
]

export function PrivacyPolicyPage() {
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
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Privacy Policy</p>
              <h1 className="mt-3 max-w-3xl text-xl font-medium tracking-tight">
                How Hatrick protects and uses your information
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
                Effective July 17, 2026. This Privacy Policy explains how Hatrick collects, uses, stores, protects, and shares information when you use the app. Hatrick is built around account security, football predictions, matchweek rankings, and responsible data handling under applicable laws in Jordan.
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
