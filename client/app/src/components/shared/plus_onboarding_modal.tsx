import { useState } from 'react'
import { ArrowRight, SlidersHorizontal, UserCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface PlusOnboardingModalProps {
  onComplete: () => void
}

export function PlusOnboardingModal({ onComplete }: PlusOnboardingModalProps) {
  const [slide, setSlide] = useState<number>(0)

  const slides = [
    {
      icon: (
        <PlusAvatarRing active className="scale-125">
          <Avatar className="h-20 w-20 border-0 shadow-none">
            <AvatarFallback>
              <AvatarPlaceholder />
            </AvatarFallback>
          </Avatar>
        </PlusAvatarRing>
      ),
      title: "Welcome to Hatrick Plus!",
      subtitle: "Your Golden Ring is Now Active",
      description: "Your profile now displays the exclusive golden avatar ring across global leaderboards, private leagues, and your profile page.",
    },
    {
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] sm:h-20 sm:w-20">
          <SlidersHorizontal className="h-9 w-9 sm:h-10 sm:w-10" />
        </div>
      ),
      title: "Custom Leagues & Scoring",
      subtitle: "Full Control Over Your Circles",
      description: "Unlock custom league creation with flexible rules, custom competition filters, and preset scoring choices tailored to your group.",
    },
    {
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] sm:h-20 sm:w-20">
          <UserCheck className="h-9 w-9 sm:h-10 sm:w-10" />
        </div>
      ),
      title: "Profile Customization",
      subtitle: "Change Username & Priority Support",
      description: "Update your handle anytime, unlock priority support channels, and host up to 20 active prediction leagues simultaneously.",
    },
  ]

  const isLast = slide === slides.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setSlide((curr) => curr + 1)
    }
  }

  const current = slides[slide]

  return (
    <div className="fixed inset-0 z-[70] flex h-svh flex-col overflow-hidden overscroll-none bg-background bg-dot-grid px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] text-foreground animate-upgrade-page-in">
      <div className="mx-auto flex h-full w-full max-w-md flex-col justify-between">
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onComplete}
            className="text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        <section className="flex flex-1 flex-col items-center justify-center text-center py-4">
          <div className="mb-6 flex justify-center items-center h-28">
            {current.icon}
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
            {current.subtitle}
          </p>

          <h2 className="mt-1.5 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {current.title}
          </h2>

          <p className="mx-auto mt-3 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm sm:max-w-sm">
            {current.description}
          </p>
        </section>

        <div className="pb-3 flex flex-col items-center gap-5">
          {/* Pagination Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            type="button"
            onClick={handleNext}
            className="h-11 w-full border-black bg-[#D4AF37] text-foreground shadow-[1.5px_1.5px_0_#000] font-medium sm:h-12 flex items-center justify-center gap-2"
          >
            <span>{isLast ? "Let's Go!" : "Continue"}</span>
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
