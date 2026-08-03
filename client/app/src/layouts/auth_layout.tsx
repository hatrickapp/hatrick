import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="dotted-background flex min-h-[100svh] flex-col items-center justify-center bg-background px-4 py-6 sm:min-h-screen sm:py-12">
      <div className="w-full max-w-[400px] lg:max-w-[520px]">
        <Outlet />
      </div>
    </div>
  )
}
