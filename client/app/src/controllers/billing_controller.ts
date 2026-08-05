import * as billing_api from '@/api/billing_api'
import { load_profile } from '@/controllers/dashboard_controller'
import { customer_has_plus, customer_plus_expiration, get_revenuecat_management_url, purchase_plus_package, restore_revenuecat_purchases } from '@/lib/revenuecat'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { BillingStatusResponse, BillingSyncResponse } from '@/types/billing_types'

let billingStatusRequest: Promise<BillingStatusResponse> | null = null
const BILLING_STATUS_CACHE_TTL_MS = 60_000

function billing_status_cache_is_fresh(): boolean {
  const store = use_dashboard_store.getState()
  return Boolean(store.billing_status && Date.now() - store.billing_status_updated_at < BILLING_STATUS_CACHE_TTL_MS)
}

export function get_cached_billing_status(): BillingStatusResponse | null {
  return use_dashboard_store.getState().billing_status
}

export async function load_billing_status(force = false): Promise<BillingStatusResponse> {
  const store = use_dashboard_store.getState()
  if (!force && store.billing_status && billing_status_cache_is_fresh()) return store.billing_status

  if (!billingStatusRequest) {
    billingStatusRequest = billing_api.get_revenuecat_billing_status()
      .then((status) => {
        use_dashboard_store.getState().set_billing_status(status)
        return status
      })
      .finally(() => {
        billingStatusRequest = null
      })
  }

  return await billingStatusRequest
}

async function sync_billing_profile(): Promise<BillingSyncResponse> {
  const result = await billing_api.sync_revenuecat_billing()
  use_dashboard_store.getState().set_billing_status(null)
  await load_profile(false, true)
  return result
}

export async function handle_purchase_plus(user_id: string): Promise<BillingSyncResponse> {
  const customerInfo = await purchase_plus_package(user_id)
  const result = await sync_billing_profile()
  if (!result.active && customer_has_plus(customerInfo)) {
    return { ...result, plan: 'plus', active: true, expires_at: customer_plus_expiration(customerInfo) }
  }
  return result
}

export async function handle_restore_purchases(user_id: string): Promise<BillingSyncResponse> {
  await restore_revenuecat_purchases(user_id)
  return await sync_billing_profile()
}

export async function handle_revenuecat_management_url(user_id: string): Promise<string | null> {
  return await get_revenuecat_management_url(user_id)
}
