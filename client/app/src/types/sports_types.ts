import type { BaseResponse } from './base_types'

export interface CompetitionItem {
  competition_id: string
  name: string
  country: string | null
  type: 'league' | 'cup'
  logo_url: string | null
  sort_order: number
}

export interface CompetitionsResponse extends BaseResponse {
  competitions: CompetitionItem[]
}

export interface TeamItem {
  team_id: string
  name: string
  short_name: string | null
  logo_url: string | null
}

export interface PlayerItem {
  player_id: string
  team_id: string | null
  name: string
  position: string | null
  shirt_number: number | null
  source: 'squad' | null
}

export interface MatchGoalItem {
  match_goal_id: string
  match_id: string
  team_id: string | null
  player_id: string | null
  scorer_name: string
  shirt_number: number | null
  event_minute: number | null
  event_extra: number | null
  goal_type: 'normal' | 'penalty' | 'own_goal' | 'shootout'
}

export interface MatchPredictionItem {
  prediction_id: string
  outcome_pick: 'home' | 'draw' | 'away'
  btts_pick: boolean
  scorer_player_id: string
  status: 'open' | 'locked' | 'settled' | 'void'
  points: number
  outcome_correct: boolean | null
  btts_correct: boolean | null
  scorer_correct: boolean | null
  hatrick_bonus_awarded: boolean
  created_at: string
  updated_at: string
}

export interface MatchListItem {
  match_id: string
  kickoff_at: string
  status: string
  status_long: string | null
  home_score: number | null
  away_score: number | null
  final_home_score: number | null
  final_away_score: number | null
  is_locked: boolean
  is_settled: boolean
  is_void: boolean
  competition: CompetitionItem
  home_team: TeamItem
  away_team: TeamItem
  user_prediction: MatchPredictionItem | null
}

export interface MatchesResponse extends BaseResponse {
  matches: MatchListItem[]
}

export interface MatchDetailResponse extends BaseResponse {
  match: MatchListItem
  players: PlayerItem[]
  goals: MatchGoalItem[]
}
