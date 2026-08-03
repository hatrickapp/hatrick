import { Sparkles } from 'lucide-react'

export function FeatureHeading({ label, plus }: { label: string; plus: boolean }) {
  return (
    <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium tracking-tight">
      <span>{label}</span>
      {plus && <Sparkles className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-label="Plus feature" />}
    </p>
  )
}

export function LockedFeatureText({ text }: { text: string }) {
  return <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground/60">{text}</p>
}
