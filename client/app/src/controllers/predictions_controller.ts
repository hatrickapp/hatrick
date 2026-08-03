import * as predictions_api from '@/api/predictions_api'
import { add_days_key, clear_stored_predictions, is_fresh, is_past_match_date, prediction_history_cache, prediction_history_key, read_stored_predictions, update_stored_matches_prediction, write_stored_predictions } from '@/cache/session_cache'
import { generate_idempotency_key } from '@/lib/idempotency'
import { clear_match_detail_cache, update_match_prediction_caches } from '@/controllers/sports_controller'
import type { PredictionHistoryCacheValue } from '@/cache/cache_types'
import type { UpsertPredictionRequest } from '@/types/prediction_types'

export function get_cached_prediction_history(cursor?: string | null, match_date?: string): PredictionHistoryCacheValue | null {
  const key = prediction_history_key(cursor, match_date)
  const cached = prediction_history_cache.get(key) ?? read_stored_predictions(key)
  if (cached) prediction_history_cache.set(key, cached)
  return cached?.value ?? null
}

export async function save_match_prediction(match_id: string, body: UpsertPredictionRequest): Promise<void> {
  const response = await predictions_api.upsert_prediction(match_id, body, generate_idempotency_key())
  update_match_prediction_caches(match_id, response.prediction)
  update_stored_matches_prediction(match_id, response.prediction)
  clear_match_detail_cache(match_id)
  prediction_history_cache.clear()
  clear_stored_predictions()
}

export async function load_prediction_history(cursor?: string | null, force = false, match_date?: string): Promise<PredictionHistoryCacheValue> {
  const key = prediction_history_key(cursor, match_date)
  const cached = prediction_history_cache.get(key) ?? read_stored_predictions(key)
  if (cached) prediction_history_cache.set(key, cached)
  if (cached && (is_past_match_date(match_date) || (!force && is_fresh(cached)))) return cached.value
  const response = await predictions_api.get_prediction_history(cursor, match_date)
  const value = { predictions: response.predictions, next_cursor: response.next_cursor }
  const entry = { value, updatedAt: Date.now() }
  prediction_history_cache.set(key, entry)
  write_stored_predictions(key, entry)
  return value
}

export async function prefetch_prediction_days(selected_date: string): Promise<void> {
  const dates = [selected_date, add_days_key(selected_date, -1), add_days_key(selected_date, -2)]
  await Promise.allSettled(
    dates.map((date) => get_cached_prediction_history(null, date) ? null : load_prediction_history(null, false, date)),
  )
}
