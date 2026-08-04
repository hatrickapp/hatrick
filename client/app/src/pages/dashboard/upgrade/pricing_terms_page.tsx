import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { ROUTES } from '@/lib/constants'

const sections = [
  {
    title: 'What does Hatrick cost?',
    body: 'Hatrick is free to start. Free users can make predictions, earn settled points, climb the global ranking, track rank progress, and keep playing without a time limit. Hatrick Plus is an optional paid plan for users who want deeper league controls and profile features.',
  },
  {
    title: 'How much is Hatrick Plus?',
    body: 'Hatrick Plus is $1.99 per month where available. The final price shown at checkout may be displayed in your local currency and may include taxes, exchange rate handling, or store specific pricing rules controlled by Apple App Store or Google Play.',
  },
  {
    title: 'What does Plus include?',
    body: 'Plus includes creating up to 20 leagues, choosing competitions for leagues, custom scoring, late join controls, a Plus Profile Badge, username changes, and priority support. These features are meant for users who want to run private prediction leagues with more control while keeping the main prediction game simple.',
  },
  {
    title: 'What stays free?',
    body: 'Free users can predict and get points forever, appear in global ranking, view rank progress, join leagues by invitation, and use the core matchweek prediction experience. Free league creation is limited compared with Plus, and some league customization features are not included in the free plan.',
  },
  {
    title: 'How are subscriptions purchased?',
    body: 'Hatrick Plus is purchased only through Apple in app purchases on iOS or Google Play in app purchases on Android. Hatrick does not sell subscriptions directly on the web, does not collect card details, and does not run its own web checkout.',
  },
  {
    title: 'Does Hatrick use a web payment processor?',
    body: 'No. Hatrick does not use cards or web payment processors for Plus subscriptions on the web. We do not process card numbers, card security codes, billing addresses, or web checkout payments for Plus. Subscription purchase, renewal, cancellation, refund handling, and payment method management happen through Apple or Google according to their store rules.',
  },
  {
    title: 'How does RevenueCat support subscriptions?',
    body: 'Hatrick uses RevenueCat to help manage in app purchase subscription status across Apple App Store and Google Play. RevenueCat helps us understand whether an account has an active Plus entitlement, restore purchases where supported, and keep subscription access in sync with the app. RevenueCat does not mean Hatrick is processing card payments on the web.',
  },
  {
    title: 'How do cancellations and refunds work?',
    body: 'You can manage or cancel your subscription through the Apple App Store or Google Play account that made the purchase. Refund requests, if available, are handled by Apple or Google under their policies. Hatrick cannot cancel a store subscription by removing the app, deleting local app data, or changing a Hatrick profile setting.',
  },
  {
    title: 'Can pricing or features change?',
    body: 'Hatrick may update Plus pricing, included features, plan limits, or availability as the product changes. If a change affects an active subscription, it will be handled through the applicable app store rules and any required notice flow. Continued use of Plus after a change means the updated plan applies where permitted.',
  },
  {
    title: 'Who can you contact about pricing?',
    body: 'For pricing questions, Plus access issues, or subscription support, contact Hatrick at support@hatrick.app. For payment method issues, charge disputes, receipts, or refunds, you may also need to use Apple App Store or Google Play support because they manage the purchase.',
  },
]

export function PricingTermsPage() {
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
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Pricing Terms</p>
            <h1 className="mt-3 text-xl font-medium tracking-tight">Hatrick pricing terms and subscription billing</h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Effective July 30, 2026. This page explains Hatrick Free, Hatrick Plus, how subscriptions are purchased, and how billing is handled through Apple App Store and Google Play in-app purchases.
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
