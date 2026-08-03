import { api_request } from './client'
import type { PredictionResponse, PredictionsHistoryResponse, UpsertPredictionRequest } from '@/types/prediction_types'

export async function upsert_prediction(
  match_id: string,
  body: UpsertPredictionRequest,
  idempotency_key: string,
): Promise<PredictionResponse> {
  return api_request<PredictionResponse>(`/v1/predictions/matches/${match_id}`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function get_prediction_history(cursor?: string | null, match_date?: string): Promise<PredictionsHistoryResponse> {
  const params = new URLSearchParams({ limit: '15' })
  if (cursor) params.set('cursor', cursor)
  if (match_date) params.set('date', match_date)
  return api_request<PredictionsHistoryResponse>(`/v1/predictions?${params.toString()}`)
}
