import * as auth_api from '@/api/auth_api'
import { warm_hatrick_data_caches } from '@/controllers/cache_orchestrator'
import { load_authenticated_profile } from '@/controllers/profile_bootstrap'
import { use_dashboard_store } from '@/store/dashboard_store'

let bootCacheRequest: Promise<void> | null = null

export async function warm_authenticated_app_cache(): Promise<void> {
  if (!bootCacheRequest) {
    bootCacheRequest = (async () => {
      const profile = await load_authenticated_profile()
      if (!profile.username_setup_completed) return

      const store = use_dashboard_store.getState()
      const [sessionsResult] = await Promise.allSettled([
        auth_api.get_sessions(),
        warm_hatrick_data_caches(true),
      ])

      if (sessionsResult.status === 'fulfilled') {
        store.set_sessions(sessionsResult.value.sessions)
      }
    })().finally(() => {
      bootCacheRequest = null
    })
  }
  return bootCacheRequest
}
