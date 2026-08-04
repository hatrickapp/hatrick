import { Outlet, useLocation } from "react-router-dom"
import { SegmentedControl } from "@/components/shared/segmented_control"
import { ROUTES } from "@/lib/constants"

export function SettingsPage() {
  const location = useLocation()

  const mobileNavItems = [
    {
      title: "Profile",
      href: ROUTES.DASHBOARD_PROFILE,
      active: location.pathname === ROUTES.DASHBOARD_PROFILE,
    },
    {
      title: "Billing",
      href: ROUTES.DASHBOARD_SETTINGS_BILLING,
      active: location.pathname === ROUTES.DASHBOARD_SETTINGS_BILLING,
    },
    {
      title: "Delete",
      href: ROUTES.DASHBOARD_SETTINGS_DELETE,
      active: location.pathname === ROUTES.DASHBOARD_SETTINGS_DELETE,
      variant: "destructive" as const,
    },
  ]

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
      <div className="max-w-2xl mx-auto px-4 pb-8 pt-5 sm:px-6 sm:py-8">
        <div className="mb-7 text-left sm:mb-12 sm:text-center">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Account Settings</h1>
          <p className="text-sm text-muted-foreground/60 mt-2">Manage your profile, billing, and account preferences</p>
        </div>

        <div className="flex flex-col gap-7 sm:gap-12">
          <SegmentedControl
            items={mobileNavItems.map((item) => ({
              value: item.href,
              label: item.title,
              href: item.href,
              tone: item.variant === "destructive" ? "destructive" : "default",
            }))}
            value={mobileNavItems.find((item) => item.active)?.href ?? ROUTES.DASHBOARD_PROFILE}
            columns={3}
            itemClassName="min-h-11 px-4 text-sm sm:px-6"
          />

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
