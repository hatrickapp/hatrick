import { api_request } from './client'
import type { BillingStatusResponse, BillingSyncResponse } from '@/types/billing_types'

const BILLING = '/v1/billing'

export async function get_revenuecat_billing_status(): Promise<BillingStatusResponse> {
  return api_request<BillingStatusResponse>(`${BILLING}/revenuecat/status`)
}

export async function sync_revenuecat_billing(): Promise<BillingSyncResponse> {
  return api_request<BillingSyncResponse>(`${BILLING}/revenuecat/sync`, {
    method: 'POST',
  })
}
