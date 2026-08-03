import type { BaseResponse } from './base_types'
import type { MatchListItem, MatchPredictionItem, PlayerItem } from './sports_types'

export interface UpsertPredictionRequest {
  outcome_pick: 'home' | 'draw' | 'away'
  btts_pick: boolean
  scorer_player_id: string
}

export interface PredictionResponse extends BaseResponse {
  prediction: MatchPredictionItem
}

export interface PredictionHistoryItem {
  prediction: MatchPredictionItem
  match: MatchListItem
  scorer: PlayerItem | null
}

export interface PredictionsHistoryResponse extends BaseResponse {
  predictions: PredictionHistoryItem[]
  next_cursor: string | null
}

export interface RankingItem {
  user_id: string
  name: string | null
  points: number
  predictions_count: number
  settled_predictions: number
  correct_outcomes: number
  correct_btts: number
  correct_scorers: number
  hatricks: number
  global_rank: number
  total_ranked_users: number
  best_global_rank: number | null
}

export interface RankingAccuracyItem {
  key: 'winner_draw' | 'btts' | 'scorer' | 'hatrick'
  label: string
  correct: number
  total: number
  ratio_percent: number
}
