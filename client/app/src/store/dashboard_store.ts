import { create } from 'zustand'
import type { DashboardStoreState } from '@/types/store_types'

export const use_dashboard_store = create<DashboardStoreState>((set) => ({
  profile: null,
  profile_updated_at: 0,
  billing_status: null,
  billing_status_updated_at: 0,
  set_profile: (profile) => set({
    profile,
    profile_updated_at: profile ? Date.now() : 0,
  }),
  set_billing_status: (billing_status) => set({
    billing_status,
    billing_status_updated_at: billing_status ? Date.now() : 0,
  }),
  clear_dashboard: () => set({
    profile: null,
    profile_updated_at: 0,
    billing_status: null,
    billing_status_updated_at: 0,
  }),
}))
