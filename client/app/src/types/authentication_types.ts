import type { BaseResponse } from './base_types'
import type { UserProfileRank, UserProfileStats } from './user_types'

export interface SessionResponse extends BaseResponse {
  session_token?: string
  expires_at: string
}

export interface MobileAuthResponse extends BaseResponse {
  session_token: string
  expires_at: string
}

export interface UserIdResponse extends BaseResponse {
  user_id: string
}

export interface AuthenticatedUser {
  session_id: string
  user_id: string
  email: string
  account_status: string
  role: 'consumer' | 'admin'
  expires_at: string
}

export interface AuthenticatedUserResponse extends BaseResponse {
  user: AuthenticatedUser | null
}

export interface UserProfileResponse extends BaseResponse {
  user_id: string
  email: string
  name: string | null
  username: string
  username_changed_at: string | null
  username_next_change_at: string | null
  username_setup_completed: boolean
  followers_count: number
  following_count: number
  account_status: string
  plan: 'free' | 'plus'
  provider: string
  timezone: string
  created_at: string
  stats: UserProfileStats
  rank: UserProfileRank | null
  next_rank: UserProfileRank | null
  points_to_next_rank: number | null
}

export interface UpdateProfileNameRequest {
  name: string
}

export interface ProfileNameResponse extends BaseResponse {
  name: string
}

export interface UpdateProfileUsernameRequest {
  username: string
}

export interface ProfileUsernameResponse extends BaseResponse {
  username: string
}

export interface UpdateProfileTimezoneRequest {
  timezone: string
}

export interface ProfileTimezoneResponse extends BaseResponse {
  timezone: string
}

export interface NativeGoogleOAuthRequest {
  id_token: string
}

export interface NativeAppleOAuthRequest {
  identity_token: string
  authorization_code?: string | null
  nonce?: string | null
  user_identifier?: string | null
  email?: string | null
  full_name?: string | null
}
