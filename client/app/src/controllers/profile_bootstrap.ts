import * as auth_api from '@/api/auth_api'
import * as billing_api from '@/api/billing_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { UserProfileResponse } from '@/types/authentication_types'

function get_browser_timezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

async function apply_detected_timezone_if_default(profile: UserProfileResponse): Promise<UserProfileResponse> {
  const detectedTimezone = get_browser_timezone()
  if (!detectedTimezone || detectedTimezone === profile.timezone || profile.timezone !== 'UTC') {
    return profile
  }

  const storageKey = `hatrick_timezone_auto_synced:${profile.user_id}`
  try {
    if (window.localStorage.getItem(storageKey) === 'true') {
      return profile
    }

    const key = generate_idempotency_key()
    const result = await auth_api.update_profile_timezone({ timezone: detectedTimezone }, key)
    window.localStorage.setItem(storageKey, 'true')
    return { ...profile, timezone: result.timezone }
  } catch {
    return profile
  }
}

export async function load_authenticated_profile(syncBilling = true): Promise<UserProfileResponse> {
  if (syncBilling) await billing_api.sync_revenuecat_billing().catch(() => undefined)
  const result = await auth_api.get_profile()
  const profile = await apply_detected_timezone_if_default(result)
  use_dashboard_store.getState().set_profile(profile)
  return profile
}
