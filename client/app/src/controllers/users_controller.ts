import * as users_api from '@/api/users_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import type { FollowListResponse, PublicUserProfileResponse } from '@/types/user_types'

const CACHE_TTL_MS = 60 * 1000
export const USERS_CACHE_UPDATED_EVENT = 'hatrick-users-cache-updated'

interface CacheEntry<T> {
  value: T
  updatedAt: number
}

type FollowMode = 'followers' | 'following'

const publicProfileCache = new Map<string, CacheEntry<PublicUserProfileResponse>>()
const followListCache = new Map<string, CacheEntry<FollowListResponse>>()
let silentRefreshInFlight: Promise<void> | null = null

function is_fresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.updatedAt < CACHE_TTL_MS
}

function username_key(username: string): string {
  return username.trim().toLowerCase()
}

function follow_list_key(username: string, mode: FollowMode, query: string, cursor?: string | null): string {
  return `${username_key(username)}:${mode}:${query.trim().toLowerCase()}:${cursor ?? 'first'}`
}

function emit_users_cache_updated() {
  window.dispatchEvent(new Event(USERS_CACHE_UPDATED_EVENT))
}

async function preload_follow_lists(username: string, force: boolean) {
  await Promise.allSettled([
    load_follow_list(username, 'followers', '', null, force),
    load_follow_list(username, 'following', '', null, force),
  ])
}

export function get_cached_public_user_profile(username: string): PublicUserProfileResponse | null {
  return publicProfileCache.get(username_key(username))?.value ?? null
}

export function get_cached_follow_list(
  username: string,
  mode: FollowMode,
  query: string,
  cursor?: string | null,
): FollowListResponse | null {
  return followListCache.get(follow_list_key(username, mode, query, cursor))?.value ?? null
}

export async function load_public_user_profile(username: string, force = false): Promise<PublicUserProfileResponse> {
  const key = username_key(username)
  const cached = publicProfileCache.get(key) ?? null
  if (!force && is_fresh(cached)) {
    void preload_follow_lists(cached.value.username, false)
    return cached.value
  }

  const profile = await users_api.get_public_user_profile(username)
  publicProfileCache.set(username_key(profile.username), { value: profile, updatedAt: Date.now() })
  if (username_key(profile.username) !== key) publicProfileCache.set(key, { value: profile, updatedAt: Date.now() })
  await preload_follow_lists(profile.username, force)
  return profile
}

export async function load_follow_list(
  username: string,
  mode: FollowMode,
  query: string,
  cursor?: string | null,
  force = false,
  signal?: AbortSignal,
): Promise<FollowListResponse> {
  const key = follow_list_key(username, mode, query, cursor)
  const cached = followListCache.get(key) ?? null
  if (!force && is_fresh(cached)) return cached.value

  const response = mode === 'followers'
    ? await users_api.list_followers(username, query, cursor, signal)
    : await users_api.list_following(username, query, cursor, signal)
  followListCache.set(key, { value: response, updatedAt: Date.now() })
  return response
}

export async function toggle_public_user_follow(profile: PublicUserProfileResponse): Promise<PublicUserProfileResponse> {
  return set_public_user_follow(profile, !profile.is_following)
}

export async function set_public_user_follow(profile: PublicUserProfileResponse, shouldFollow: boolean): Promise<PublicUserProfileResponse> {
  const username = username_key(profile.username)
  const response = shouldFollow
    ? await users_api.follow_user(username, generate_idempotency_key())
    : await users_api.unfollow_user(username, generate_idempotency_key())

  const nextProfile = {
    ...profile,
    followers_count: response.followers_count,
    following_count: response.following_count,
    is_following: response.is_following,
  }

  publicProfileCache.set(username_key(profile.username), { value: nextProfile, updatedAt: Date.now() })
  Array.from(followListCache.keys()).forEach((key) => {
    if (key.startsWith(`${username_key(profile.username)}:`)) followListCache.delete(key)
  })
  emit_users_cache_updated()
  return nextProfile
}

export async function refresh_users_caches_silently(): Promise<void> {
  if (silentRefreshInFlight) return silentRefreshInFlight

  silentRefreshInFlight = (async () => {
    const profileUsernames = Array.from(publicProfileCache.values()).map((entry) => entry.value.username)
    const followRequests = Array.from(followListCache.keys()).map((key) => {
      const [username, mode, query, cursor] = key.split(':') as [string, FollowMode, string, string]
      return load_follow_list(username, mode, query, cursor === 'first' ? null : cursor, true)
    })

    await Promise.allSettled([
      ...profileUsernames.map((username) => load_public_user_profile(username, true)),
      ...followRequests,
    ])
    emit_users_cache_updated()
  })().finally(() => {
    silentRefreshInFlight = null
  })

  return silentRefreshInFlight
}
