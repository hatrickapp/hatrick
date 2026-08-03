import type { BaseResponse } from './base_types'

export interface BillingStatusResponse extends BaseResponse {
  plan: 'free' | 'plus'
  active: boolean
  has_restorable_purchase: boolean
  expires_at: string | null
  unsubscribe_detected_at: string | null
}

export interface BillingSyncResponse extends BaseResponse {
  plan: 'free' | 'plus'
  entitlement_id: string
  active: boolean
  expires_at: string | null
}
