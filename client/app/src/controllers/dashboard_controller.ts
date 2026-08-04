import * as auth_api from '@/api/auth_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import { clear_auth_tokens } from '@/lib/auth_tokens'
import { log_out_revenuecat } from '@/lib/revenuecat'
import { use_auth_store } from '@/store/auth_store'
import { use_dashboard_store } from '@/store/dashboard_store'
import { load_authenticated_profile } from '@/controllers/profile_bootstrap'

let profile_request: Promise<void> | null = null
const PROFILE_CACHE_TTL_MS = 60_000

function profile_cache_is_fresh(): boolean {
  const store = use_dashboard_store.getState()
  return Boolean(store.profile && Date.now() - store.profile_updated_at < PROFILE_CACHE_TTL_MS)
}

export async function load_profile(syncBilling = true, force = false): Promise<void> {
  if (!force && profile_cache_is_fresh()) return

  if (!profile_request) {
    profile_request = load_authenticated_profile(syncBilling)
      .then(() => undefined)
      .finally(() => {
        profile_request = null
      })
  }
  return profile_request
}

export async function handle_update_profile_name(name: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_name({ name }, key)
  await load_profile(false, true)
}

export async function handle_update_profile_username(username: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_username({ username }, key)
  await load_profile(false, true)
}

export async function handle_update_profile_timezone(timezone: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_timezone({ timezone }, key)
  await load_profile(false, true)
}

export async function handle_account_delete_initiate(): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.account_delete_initiate(key)
}

export async function handle_account_delete_complete(otp: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.account_delete_complete({ otp }, key)
  await clear_auth_tokens()
  await log_out_revenuecat()
  use_auth_store.getState().clear()
  const ds = use_dashboard_store.getState()
  ds.clear_dashboard()
}
