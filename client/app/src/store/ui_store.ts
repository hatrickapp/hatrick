import { create } from 'zustand'
import type { UiStoreState } from '@/types/store_types'

export const use_ui_store = create<UiStoreState>((set) => ({
  top_nav_back: null,
  hide_top_nav_search: false,
  set_top_nav_back: (handler) => set({ top_nav_back: handler }),
  set_hide_top_nav_search: (hidden) => set({ hide_top_nav_search: hidden }),
}))
