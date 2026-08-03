import { create } from 'zustand'
import type { DashboardStoreState } from '@/types/store_types'

export const use_dashboard_store = create<DashboardStoreState>((set) => ({
  profile: null,
  sessions: [],
  set_profile: (profile) => set({ profile }),
  set_sessions: (sessions) => set({ sessions }),
}))
