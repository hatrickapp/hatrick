import { api_request } from './client'
import type { CompetitionsResponse, MatchDetailResponse, MatchesResponse } from '@/types/sports_types'

const SPORTS = '/v1/sports'

export async function get_competitions(): Promise<CompetitionsResponse> {
  return api_request<CompetitionsResponse>(`${SPORTS}/competitions`)
}

export async function get_matches(competition_id?: string, match_date?: string): Promise<MatchesResponse> {
  const params = new URLSearchParams()
  if (competition_id) params.set('competition_id', competition_id)
  if (match_date) params.set('date', match_date)
  const query = params.toString()
  return api_request<MatchesResponse>(query ? `${SPORTS}/matches?${query}` : `${SPORTS}/matches`)
}

export async function get_match_detail(match_id: string): Promise<MatchDetailResponse> {
  return api_request<MatchDetailResponse>(`${SPORTS}/matches/${match_id}`)
}
