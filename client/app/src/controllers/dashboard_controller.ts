import * as auth_api from '@/api/auth_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import { clear_auth_tokens } from '@/lib/auth_tokens'
import { log_out_revenuecat } from '@/lib/revenuecat'
import { use_auth_store } from '@/store/auth_store'
import { use_dashboard_store } from '@/store/dashboard_store'
import { load_authenticated_profile } from '@/controllers/profile_bootstrap'

let profile_request: Promise<void> | null = null
let sessions_request: Promise<void> | null = null
let devices_request: Promise<void> | null = null

export async function load_profile(syncBilling = true): Promise<void> {
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
  await load_profile()
}

export async function handle_update_profile_username(username: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_username({ username }, key)
  await load_profile()
}

export async function handle_update_profile_visibility(show_name_publicly: boolean): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_visibility({ show_name_publicly }, key)
  await load_profile()
}

export async function handle_update_profile_timezone(timezone: string): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.update_profile_timezone({ timezone }, key)
  await load_profile()
}

export async function load_sessions(): Promise<void> {
  if (!sessions_request) {
    sessions_request = auth_api.get_sessions()
      .then((result) => {
        use_dashboard_store.getState().set_sessions(result.sessions)
      })
      .finally(() => {
        sessions_request = null
      })
  }
  return sessions_request
}

export async function load_devices(): Promise<void> {
  if (!devices_request) {
    devices_request = auth_api.get_devices()
      .then((result) => {
        use_dashboard_store.getState().set_devices(result.devices)
      })
      .finally(() => {
        devices_request = null
      })
  }
  return devices_request
}

export async function handle_delete_devices(device_ids: string[]): Promise<void> {
  const key = generate_idempotency_key()
  await auth_api.delete_devices({ device_ids }, key)
  await clear_auth_tokens()
  await log_out_revenuecat()
  use_auth_store.getState().clear()
  const ds = use_dashboard_store.getState()
  ds.set_profile(null)
  ds.set_sessions([])
  ds.set_devices([])
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
  ds.set_profile(null)
  ds.set_sessions([])
  ds.set_devices([])
}
