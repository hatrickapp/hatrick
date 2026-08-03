import { api_request } from './client'
import type { BaseResponse } from '@/types/base_types'
import type { CreateLeagueInvitationRequest, CreateLeagueRequest, LeagueInvitationResponse, LeagueInvitationsResponse, LeagueResponse, LeagueStandingsResponse, LeaguesConfigResponse, LeaguesHomeResponse, UpdateLeagueRequest } from '@/types/league_types'

const LEAGUES = '/v1/leagues'

export async function get_leagues(): Promise<LeaguesHomeResponse> {
  return api_request<LeaguesHomeResponse>(LEAGUES)
}

export async function get_leagues_config(): Promise<LeaguesConfigResponse> {
  return api_request<LeaguesConfigResponse>(`${LEAGUES}/config`)
}

export async function create_league(body: CreateLeagueRequest, idempotency_key: string): Promise<LeagueResponse> {
  return api_request<LeagueResponse>(LEAGUES, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function get_league_invitations(): Promise<LeagueInvitationsResponse> {
  return api_request<LeagueInvitationsResponse>(`${LEAGUES}/invitations`)
}

export async function join_league_invitation(league_invitation_id: string, idempotency_key: string): Promise<LeagueResponse> {
  return api_request<LeagueResponse>(`${LEAGUES}/invitations/${league_invitation_id}/join`, {
    method: 'POST',
    idempotency_key,
  })
}

export async function reject_league_invitation(league_invitation_id: string, idempotency_key: string): Promise<BaseResponse> {
  return api_request<BaseResponse>(`${LEAGUES}/invitations/${league_invitation_id}/reject`, {
    method: 'POST',
    idempotency_key,
  })
}

export async function get_league(league_id: string): Promise<LeagueResponse> {
  return api_request<LeagueResponse>(`${LEAGUES}/${league_id}`)
}

export async function get_league_standings(league_id: string, cursor?: string | null): Promise<LeagueStandingsResponse> {
  const params = new URLSearchParams({ limit: '15' })
  if (cursor) params.set('cursor', cursor)
  return api_request<LeagueStandingsResponse>(`${LEAGUES}/${league_id}/standings?${params.toString()}`)
}

export async function update_league(league_id: string, body: UpdateLeagueRequest, idempotency_key: string): Promise<LeagueResponse> {
  return api_request<LeagueResponse>(`${LEAGUES}/${league_id}/settings`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function create_league_invitation(league_id: string, body: CreateLeagueInvitationRequest, idempotency_key: string): Promise<LeagueInvitationResponse> {
  return api_request<LeagueInvitationResponse>(`${LEAGUES}/${league_id}/invitations`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function leave_league(league_id: string, idempotency_key: string): Promise<BaseResponse> {
  return api_request<BaseResponse>(`${LEAGUES}/${league_id}/leave`, {
    method: 'POST',
    idempotency_key,
  })
}

export async function remove_league_member(league_id: string, member_user_id: string, idempotency_key: string): Promise<LeagueResponse> {
  return api_request<LeagueResponse>(`${LEAGUES}/${league_id}/members/${member_user_id}/remove`, {
    method: 'POST',
    idempotency_key,
  })
}
