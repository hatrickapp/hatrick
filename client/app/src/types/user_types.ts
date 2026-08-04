import type { BaseResponse } from './base_types'
import type { RankingAccuracyItem, RankingItem } from './prediction_types'

export interface UserProfileStats {
  total_points: number
  predictions_count: number
  settled_predictions: number
  correct_outcomes: number
  correct_btts: number
  correct_scorers: number
  hatricks: number
}

export interface UserProfileRank {
  rank_key: string
  name: string
  min_points: number
  icon_key: string
  color_hex: string
}

export interface PublicUserSearchItem {
  user_id: string
  username: string
  name: string | null
  plan: 'free' | 'plus'
}

export interface PublicUserSearchResponse extends BaseResponse {
  users: PublicUserSearchItem[]
  next_cursor: string | null
}

export interface FollowUserItem {
  user_id: string
  username: string
  name: string | null
  plan: 'free' | 'plus'
  is_following: boolean
}

export interface FollowListResponse extends BaseResponse {
  users: FollowUserItem[]
  next_cursor: string | null
}

export interface FollowStatusResponse extends BaseResponse {
  followers_count: number
  following_count: number
  is_following: boolean
}

export interface PublicUserProfileResponse extends BaseResponse {
  user_id: string
  username: string
  name: string | null
  followers_count: number
  following_count: number
  is_following: boolean
  plan: 'free' | 'plus'
  stats: UserProfileStats
  ranking: RankingItem
  rank: UserProfileRank | null
  next_rank: UserProfileRank | null
  points_to_next_rank: number | null
  top_percentage: number
  accuracy?: RankingAccuracyItem[]
  ranking_rules: string[]
}
