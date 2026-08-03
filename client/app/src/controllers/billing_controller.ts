import * as billing_api from '@/api/billing_api'
import { load_profile } from '@/controllers/dashboard_controller'
import { customer_has_plus, get_revenuecat_management_url, purchase_plus_package, restore_revenuecat_purchases } from '@/lib/revenuecat'
import type { BillingStatusResponse, BillingSyncResponse } from '@/types/billing_types'

export async function load_billing_status(): Promise<BillingStatusResponse> {
  return await billing_api.get_revenuecat_billing_status()
}

async function sync_billing_profile(): Promise<BillingSyncResponse> {
  const result = await billing_api.sync_revenuecat_billing()
  await load_profile(false)
  return result
}

export async function handle_purchase_plus(user_id: string): Promise<BillingSyncResponse> {
  const customerInfo = await purchase_plus_package(user_id)
  const result = await sync_billing_profile()
  if (!result.active && customer_has_plus(customerInfo)) return result
  return result
}

export async function handle_restore_purchases(user_id: string): Promise<BillingSyncResponse> {
  await restore_revenuecat_purchases(user_id)
  return await sync_billing_profile()
}

export async function handle_revenuecat_management_url(user_id: string): Promise<string | null> {
  return await get_revenuecat_management_url(user_id)
}
