import { Link, useLocation } from 'react-router-dom'
import { get_dashboard_nav_items } from '@/components/shared/dashboard_nav_config'
import { use_dashboard_store } from '@/store/dashboard_store'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const location = useLocation()
  const profile = use_dashboard_store((state) => state.profile)
  const items = get_dashboard_nav_items(profile)

  return (
    <nav className="shrink-0 border-t border-border/30 bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),0.15rem)] pt-1 shadow-[0_-1px_8px_rgba(31,41,51,0.04)] backdrop-blur-md">
      <div className="mx-auto grid max-w-[430px] grid-cols-4 sm:max-w-[520px] md:max-w-[720px] lg:max-w-[920px]">
        {items.map((item) => {
          const isActive = item.match(location.pathname)

          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1.5 px-1 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground/70 '
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate leading-4">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
