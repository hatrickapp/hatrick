import * as auth_api from '@/api/auth_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import { get_authenticated_home_path, ROUTES } from '@/lib/constants'
import { clear_session_token } from '@/lib/auth_tokens'
import { native_apple_identity, native_google_id_token } from '@/lib/native_oauth'
import { ensure_revenuecat_configured, log_out_revenuecat } from '@/lib/revenuecat'
import { warm_authenticated_app_cache } from '@/controllers/app_boot_controller'
import { load_authenticated_profile } from '@/controllers/profile_bootstrap'
import { use_auth_store } from '@/store/auth_store'

import { use_dashboard_store } from '@/store/dashboard_store'
import type { AuthenticatedUser } from '@/types/authentication_types'

export async function check_session(): Promise<AuthenticatedUser | null> {
  const store = use_auth_store.getState()
  try {
    const result = await auth_api.get_me()
    if (result.user) {
      store.set_user(result.user)
      void ensure_revenuecat_configured(result.user.user_id).catch(() => undefined)
      store.set_loading(false)
      return result.user
    }
    store.clear()
    return null
  } catch {
    store.clear()
    return null
  }
}

export async function get_post_auth_redirect_path(role?: string | null): Promise<string> {
  try {
    const profile = await load_authenticated_profile()
    if (!profile.username_setup_completed) return ROUTES.USERNAME_SETUP
    await warm_authenticated_app_cache()
  } catch {
    return get_authenticated_home_path(role)
  }
  return get_authenticated_home_path(role)
}

export async function handle_logout(): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.logout(key)
  await clear_session_token()
  await log_out_revenuecat()
  use_auth_store.getState().clear()
  const ds = use_dashboard_store.getState()
  ds.set_profile(null)
  ds.set_sessions([])
  ds.set_devices([])
}

export async function handle_google_native_sign_in(): Promise<AuthenticatedUser | null> {
  const id_token = await native_google_id_token()
  await auth_api.oauth_google_native({ id_token })
  return await check_session()
}

export async function handle_apple_native_sign_in(): Promise<AuthenticatedUser | null> {
  const body = await native_apple_identity()
  await auth_api.oauth_apple_native(body)
  return await check_session()
}
