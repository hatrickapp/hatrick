import type { BaseResponse } from './base_types'
import type { CompetitionItem } from './sports_types'

export interface LeagueScoringItem {
  include_outcome_points: boolean
  include_btts_points: boolean
  include_scorer_points: boolean
  include_hatrick_bonus: boolean
  only_hatricks: boolean
}

export interface LeagueSummaryItem {
  league_id: string
  host_user_id: string
  host_username: string
  host_name: string | null
  name: string
  status: 'active' | 'paused' | 'closed' | 'finished' | 'deleted'
  starts_at: string
  ends_at: string
  include_existing_points: boolean
  max_members: number
  member_count: number
  scoring: LeagueScoringItem
  winner_user_id: string | null
  finished_at: string | null
  is_host: boolean
  user_rank: number | null
  user_points: number | null
  competitions: CompetitionItem[]
}

export interface LeagueInvitationItem {
  league_invitation_id: string
  league: LeagueSummaryItem
  invited_by_user_id: string
  invited_by_username: string
  invited_by_name: string | null
  invited_by_avatar_url: string | null
  invited_by_plan: 'free' | 'plus'
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  responded_at: string | null
  expires_at: string
}

export interface LeagueStandingItem {
  user_id: string
  username: string
  name: string | null
  avatar_url: string | null
  plan: 'free' | 'plus'
  rank: number
  points: number
  predictions_count: number
  correct_outcomes: number
  correct_btts: number
  correct_scorers: number
  hatricks: number
  is_current_user: boolean
}

export interface CreateLeagueRequest {
  name: string
  competition_ids: string[]
  scoring: LeagueScoringItem
  starts_at: string
  ends_at: string
  include_existing_points: boolean
  max_members: number
}

export interface PlanLimitItem {
  plan: 'free' | 'plus'
  active_league_limit: number
  can_customize_competitions: boolean
  can_customize_scoring: boolean
  can_count_existing_points: boolean
  can_change_username: boolean
  priority_support: boolean
}

export interface LeagueLimitItem {
  default_max_members: number
  max_members: number
  max_period_days: number
  max_start_days_ahead: number
}

export interface PlusOfferingItem {
  price_label: string
  cta_label: string
  features: string[]
}

export interface LeagueScoringPresetItem {
  preset_key: string
  label: string
  description: string
  scoring: LeagueScoringItem
  is_default: boolean
}

export interface UpdateLeagueRequest {
  ends_at?: string
  status?: 'active' | 'paused' | 'closed' | 'deleted'
}

export interface CreateLeagueInvitationRequest {
  user_id: string
}

export interface LeaguesHomeResponse extends BaseResponse {
  active_leagues: LeagueSummaryItem[]
  history_leagues: LeagueSummaryItem[]
}

export interface LeaguesConfigResponse extends BaseResponse {
  plan_limits: Record<'free' | 'plus', PlanLimitItem>
  league_limits: LeagueLimitItem
  plus_offering: PlusOfferingItem
  scoring_presets: LeagueScoringPresetItem[]
}

export interface LeagueResponse extends BaseResponse {
  league: LeagueSummaryItem
}

export interface LeagueInvitationResponse extends BaseResponse {
  invitation: LeagueInvitationItem
}

export interface LeagueInvitationsResponse extends BaseResponse {
  invitations: LeagueInvitationItem[]
}

export interface LeagueStandingsResponse extends BaseResponse {
  standings: LeagueStandingItem[]
  next_cursor: string | null
}
