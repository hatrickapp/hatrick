import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type BackIconButtonProps = {
  to?: string
  state?: unknown
  onClick?: () => void
  className?: string
  ariaLabel?: string
}

export function BackIconButton({
  to,
  state,
  onClick,
  className,
  ariaLabel = 'Back',
}: BackIconButtonProps) {
  const buttonClassName = [
    'h-10 w-10 rounded-lg p-0 text-muted-foreground shadow-none hover:text-foreground',
    'sm:h-12 sm:w-12',
    className ?? '',
  ].join(' ')

  if (to) {
    return (
      <Button variant="ghost" asChild className={buttonClassName} aria-label={ariaLabel}>
        <Link to={to} state={state}>
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </Link>
      </Button>
    )
  }

  return (
    <Button type="button" variant="ghost" onClick={onClick} className={buttonClassName} aria-label={ariaLabel}>
      <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
    </Button>
  )
}
