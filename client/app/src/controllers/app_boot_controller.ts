import { warm_hatrick_data_caches } from '@/controllers/cache_orchestrator'
import { load_authenticated_profile } from '@/controllers/profile_bootstrap'

let bootCacheRequest: Promise<void> | null = null

export async function warm_authenticated_app_cache(): Promise<void> {
  if (!bootCacheRequest) {
    bootCacheRequest = (async () => {
      const profile = await load_authenticated_profile()
      if (!profile.username_setup_completed) return

      await warm_hatrick_data_caches(true)
    })().finally(() => {
      bootCacheRequest = null
    })
  }
  return bootCacheRequest
}
