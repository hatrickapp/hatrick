import * as leagues_api from '@/api/leagues_api'
import { generate_idempotency_key } from '@/lib/idempotency'
import { is_fresh, league_detail_cache, league_invitations_cache, league_standings_cache, league_standings_key, leagues_config_cache, leagues_home_cache, set_league_invitations_cache, set_leagues_config_cache, set_leagues_home_cache } from '@/cache/session_cache'
import type { CreateLeagueRequest, LeagueInvitationResponse, LeagueInvitationsResponse, LeagueResponse, LeagueStandingsResponse, LeaguesConfigResponse, LeaguesHomeResponse, UpdateLeagueRequest } from '@/types/league_types'

export function get_cached_leagues_home(): LeaguesHomeResponse | null {
  return leagues_home_cache?.value ?? null
}

export function get_cached_leagues_config(): LeaguesConfigResponse | null {
  return leagues_config_cache?.value ?? null
}

export function get_cached_league_invitations(): LeagueInvitationsResponse | null {
  return league_invitations_cache?.value ?? null
}

export function get_cached_league_detail(league_id: string): LeagueResponse | null {
  return league_detail_cache.get(league_id)?.value ?? null
}

export function get_cached_league_standings(league_id: string, cursor?: string | null): LeagueStandingsResponse | null {
  return league_standings_cache.get(league_standings_key(league_id, cursor))?.value ?? null
}

export async function load_leagues_home(force = false): Promise<LeaguesHomeResponse> {
  if (!force && is_fresh(leagues_home_cache)) return leagues_home_cache.value
  const response = await leagues_api.get_leagues()
  set_leagues_home_cache({ value: response, updatedAt: Date.now() })
  return response
}

export async function load_leagues_config(force = false): Promise<LeaguesConfigResponse> {
  if (!force && is_fresh(leagues_config_cache)) return leagues_config_cache.value
  const response = await leagues_api.get_leagues_config()
  set_leagues_config_cache({ value: response, updatedAt: Date.now() })
  return response
}

export async function load_league_invitations(force = false): Promise<LeagueInvitationsResponse> {
  if (!force && is_fresh(league_invitations_cache)) return league_invitations_cache.value
  const response = await leagues_api.get_league_invitations()
  set_league_invitations_cache({ value: response, updatedAt: Date.now() })
  return response
}

export async function create_hatrick_league(body: CreateLeagueRequest): Promise<LeagueResponse> {
  const response = await leagues_api.create_league(body, generate_idempotency_key())
  set_leagues_home_cache(null)
  league_detail_cache.set(response.league.league_id, { value: response, updatedAt: Date.now() })
  league_standings_cache.clear()
  return response
}

export async function invite_user_to_hatrick_league(league_id: string, user_id: string): Promise<LeagueInvitationResponse> {
  const response = await leagues_api.create_league_invitation(league_id, { user_id }, generate_idempotency_key())
  set_league_invitations_cache(null)
  return response
}

export async function join_hatrick_league_invitation(league_invitation_id: string): Promise<LeagueResponse> {
  const response = await leagues_api.join_league_invitation(league_invitation_id, generate_idempotency_key())
  set_leagues_home_cache(null)
  set_league_invitations_cache(null)
  league_detail_cache.set(response.league.league_id, { value: response, updatedAt: Date.now() })
  league_standings_cache.clear()
  return response
}

export async function reject_hatrick_league_invitation(league_invitation_id: string): Promise<void> {
  await leagues_api.reject_league_invitation(league_invitation_id, generate_idempotency_key())
  set_league_invitations_cache(null)
}

export async function load_league_detail(league_id: string, force = false): Promise<LeagueResponse> {
  const cached = league_detail_cache.get(league_id) ?? null
  if (!force && is_fresh(cached)) return cached.value
  const response = await leagues_api.get_league(league_id)
  league_detail_cache.set(league_id, { value: response, updatedAt: Date.now() })
  return response
}

export async function load_league_standings(league_id: string, cursor?: string | null, force = false): Promise<LeagueStandingsResponse> {
  const key = league_standings_key(league_id, cursor)
  const cached = league_standings_cache.get(key) ?? null
  if (!force && is_fresh(cached)) return cached.value
  const response = await leagues_api.get_league_standings(league_id, cursor)
  league_standings_cache.set(key, { value: response, updatedAt: Date.now() })
  return response
}

export async function update_hatrick_league(league_id: string, body: UpdateLeagueRequest): Promise<LeagueResponse> {
  const response = await leagues_api.update_league(league_id, body, generate_idempotency_key())
  set_leagues_home_cache(null)
  league_detail_cache.set(league_id, { value: response, updatedAt: Date.now() })
  return response
}

export async function leave_hatrick_league(league_id: string): Promise<void> {
  await leagues_api.leave_league(league_id, generate_idempotency_key())
  set_leagues_home_cache(null)
  league_detail_cache.delete(league_id)
  Array.from(league_standings_cache.keys()).forEach((key) => {
    if (key.startsWith(`${league_id}:`)) league_standings_cache.delete(key)
  })
}

export async function remove_hatrick_league_member(league_id: string, member_user_id: string): Promise<LeagueResponse> {
  const response = await leagues_api.remove_league_member(league_id, member_user_id, generate_idempotency_key())
  set_leagues_home_cache(null)
  league_detail_cache.set(league_id, { value: response, updatedAt: Date.now() })
  Array.from(league_standings_cache.keys()).forEach((key) => {
    if (key.startsWith(`${league_id}:`)) league_standings_cache.delete(key)
  })
  return response
}

export function league_ids_from_home(home: LeaguesHomeResponse | null): string[] {
  if (!home) return []
  return Array.from(new Set([...home.active_leagues, ...home.history_leagues].map((league) => league.league_id)))
}
