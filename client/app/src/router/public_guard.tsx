import { Navigate, Outlet } from 'react-router-dom'
import { use_auth_store } from '@/store/auth_store'
import { PageLoader } from '@/components/shared/page_loader'
import { get_authenticated_home_path } from '@/lib/constants'
import { useSessionCheck } from '@/router/use_session_check'

export function PublicGuard() {
  const is_authenticated = use_auth_store((state) => state.is_authenticated)
  const is_loading = use_auth_store((state) => state.is_loading)
  const user = use_auth_store((state) => state.user)
  useSessionCheck()

  if (is_loading) return <PageLoader />
  if (is_authenticated) return <Navigate to={get_authenticated_home_path(user?.role)} replace />
  return <Outlet />
}
