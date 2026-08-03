import { api_request } from './client'
import type { FollowListResponse, FollowStatusResponse, PublicUserProfileResponse, PublicUserSearchResponse } from '@/types/user_types'

const USERS = '/v1/users'

export async function search_users(
  query: string,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<PublicUserSearchResponse> {
  const params = new URLSearchParams({ q: query, limit: '10' })
  if (cursor) params.set('cursor', cursor)
  return api_request<PublicUserSearchResponse>(`${USERS}/search?${params.toString()}`, { signal })
}

export async function get_public_user_profile(username: string): Promise<PublicUserProfileResponse> {
  return api_request<PublicUserProfileResponse>(`${USERS}/${encodeURIComponent(username)}`)
}

export async function follow_user(username: string, idempotency_key: string): Promise<FollowStatusResponse> {
  return api_request<FollowStatusResponse>(`${USERS}/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
    idempotency_key,
  })
}

export async function unfollow_user(username: string, idempotency_key: string): Promise<FollowStatusResponse> {
  return api_request<FollowStatusResponse>(`${USERS}/${encodeURIComponent(username)}/unfollow`, {
    method: 'POST',
    idempotency_key,
  })
}

export async function list_followers(
  username: string,
  query: string,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<FollowListResponse> {
  const params = new URLSearchParams({ q: query, limit: '15' })
  if (cursor) params.set('cursor', cursor)
  return api_request<FollowListResponse>(`${USERS}/${encodeURIComponent(username)}/followers?${params.toString()}`, { signal })
}

export async function list_following(
  username: string,
  query: string,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<FollowListResponse> {
  const params = new URLSearchParams({ q: query, limit: '15' })
  if (cursor) params.set('cursor', cursor)
  return api_request<FollowListResponse>(`${USERS}/${encodeURIComponent(username)}/following?${params.toString()}`, { signal })
}
