import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import logoSrc from '@/assets/logo.png'

interface AppMarkProps {
  className?: string
  markClassName?: string
  textClassName?: string
  showText?: boolean
}

export function AppMark({
  className,
  markClassName,
  textClassName,
  showText = true,
}: AppMarkProps) {
  return (
    <div className={cn('inline-flex items-center justify-center gap-3', className)}>
      <span
        className={cn(
          'flex h-16 w-16 items-center justify-center',
          markClassName,
        )}
      >
        <img src={logoSrc} alt="" aria-hidden="true" className="h-full w-full object-contain" />
      </span>
      {showText && (
        <span className={cn('text-xl font-black tracking-normal text-foreground', textClassName)}>
          {APP_NAME}
        </span>
      )}
    </div>
  )
}
