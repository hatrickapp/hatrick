import * as sports_api from '@/api/sports_api'
import { add_days_key, competitions_cache, is_fresh, is_past_match_date, match_detail_cache, matches_cache, matches_key, read_stored_matches, set_competitions_cache, write_stored_matches } from '@/cache/session_cache'
import type { CompetitionItem, MatchDetailResponse, MatchListItem } from '@/types/sports_types'

export function get_cached_competitions(): CompetitionItem[] | null {
  return competitions_cache?.value ?? null
}

export function get_cached_matches(_scope: 'today', competition_id?: string, match_date?: string): MatchListItem[] | null {
  const key = matches_key(competition_id, match_date)
  const cached = matches_cache.get(key) ?? read_stored_matches(key)
  if (cached) matches_cache.set(key, cached)
  return cached?.value ?? null
}

export function get_cached_match_detail(match_id: string): MatchDetailResponse | null {
  return match_detail_cache.get(match_id)?.value ?? null
}

export async function load_competitions(force = false): Promise<CompetitionItem[]> {
  if (!force && is_fresh(competitions_cache)) return competitions_cache.value
  const response = await sports_api.get_competitions()
  const entry = { value: response.competitions, updatedAt: Date.now() }
  set_competitions_cache(entry)
  return entry.value
}

export async function load_matches(_scope: 'today', competition_id?: string, force = false, match_date?: string): Promise<MatchListItem[]> {
  const key = matches_key(competition_id, match_date)
  const cached = matches_cache.get(key) ?? read_stored_matches(key)
  if (cached) matches_cache.set(key, cached)
  if (cached && (is_past_match_date(match_date) || (!force && is_fresh(cached)))) return cached.value
  const response = await sports_api.get_matches(competition_id, match_date)
  const entry = { value: response.matches, updatedAt: Date.now() }
  matches_cache.set(key, entry)
  write_stored_matches(key, entry)
  return response.matches
}

export async function prefetch_match_days(selected_date: string): Promise<void> {
  const dates = [selected_date, add_days_key(selected_date, -1), add_days_key(selected_date, -2)]
  await Promise.allSettled(
    dates.map((date) => get_cached_matches('today', undefined, date) ? null : load_matches('today', undefined, false, date)),
  )
}

export async function load_match_detail(match_id: string, force = false): Promise<MatchDetailResponse> {
  const cached = match_detail_cache.get(match_id) ?? null
  if (!force && is_fresh(cached)) return cached.value
  const response = await sports_api.get_match_detail(match_id)
  match_detail_cache.set(match_id, { value: response, updatedAt: Date.now() })
  return response
}

export function update_match_prediction_caches(match_id: string, user_prediction: MatchListItem['user_prediction']) {
  matches_cache.forEach((entry, key) => {
    if (!entry.value.some((match) => match.match_id === match_id)) return
    const nextEntry = {
      value: entry.value.map((match) => match.match_id === match_id ? { ...match, user_prediction } : match),
      updatedAt: Date.now(),
    }
    matches_cache.set(key, nextEntry)
    write_stored_matches(key, nextEntry)
  })
}

export function clear_match_detail_cache(match_id: string) {
  match_detail_cache.delete(match_id)
}
