import type { PredictionHistoryItem } from '@/types/prediction_types'

export interface CacheEntry<T> {
  value: T
  updatedAt: number
}

export interface PredictionHistoryCacheValue {
  predictions: PredictionHistoryItem[]
  next_cursor: string | null
}
