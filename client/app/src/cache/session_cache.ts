import type { CacheEntry, PredictionHistoryCacheValue } from '@/cache/cache_types'
import type { LeagueInvitationsResponse, LeagueResponse, LeagueStandingsResponse, LeaguesConfigResponse, LeaguesHomeResponse } from '@/types/league_types'
import type { MatchDetailResponse, MatchListItem } from '@/types/sports_types'
import type { CompetitionItem } from '@/types/sports_types'

export const CACHE_TTL_MS = 60 * 1000

const MATCHES_STORAGE_PREFIX = 'hatrick_matches:'
const PREDICTIONS_STORAGE_PREFIX = 'hatrick_predictions:'

export let competitions_cache: CacheEntry<CompetitionItem[]> | null = null
export const matches_cache = new Map<string, CacheEntry<MatchListItem[]>>()
export const match_detail_cache = new Map<string, CacheEntry<MatchDetailResponse>>()
export const prediction_history_cache = new Map<string, CacheEntry<PredictionHistoryCacheValue>>()
export let leagues_home_cache: CacheEntry<LeaguesHomeResponse> | null = null
export let leagues_config_cache: CacheEntry<LeaguesConfigResponse> | null = null
export let league_invitations_cache: CacheEntry<LeagueInvitationsResponse> | null = null
export const league_detail_cache = new Map<string, CacheEntry<LeagueResponse>>()
export const league_standings_cache = new Map<string, CacheEntry<LeagueStandingsResponse>>()

export function set_competitions_cache(entry: CacheEntry<CompetitionItem[]> | null) {
  competitions_cache = entry
}

export function set_leagues_home_cache(entry: CacheEntry<LeaguesHomeResponse> | null) {
  leagues_home_cache = entry
}

export function set_leagues_config_cache(entry: CacheEntry<LeaguesConfigResponse> | null) {
  leagues_config_cache = entry
}

export function set_league_invitations_cache(entry: CacheEntry<LeagueInvitationsResponse> | null) {
  league_invitations_cache = entry
}

export function is_fresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.updatedAt < CACHE_TTL_MS
}

export function matches_key(competition_id?: string, match_date?: string): string {
  return `${match_date ?? today_key()}:${competition_id ?? 'all'}`
}

export function today_key(): string {
  return new Date().toISOString().slice(0, 10)
}

export function is_past_match_date(match_date?: string): boolean {
  return Boolean(match_date && match_date < today_key())
}

export function add_days_key(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function prediction_history_key(cursor?: string | null, match_date?: string): string {
  return `${match_date ?? 'all'}:${cursor ?? 'first'}`
}

export function league_standings_key(league_id: string, cursor?: string | null): string {
  return `${league_id}:${cursor ?? 'first'}`
}

export function read_stored_matches(key: string): CacheEntry<MatchListItem[]> | null {
  try {
    const raw = sessionStorage.getItem(`${MATCHES_STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) as CacheEntry<MatchListItem[]> : null
  } catch {
    return null
  }
}

export function write_stored_matches(key: string, entry: CacheEntry<MatchListItem[]>) {
  try {
    sessionStorage.setItem(`${MATCHES_STORAGE_PREFIX}${key}`, JSON.stringify(entry))
  } catch {
    return
  }
}

export function read_stored_predictions(key: string): CacheEntry<PredictionHistoryCacheValue> | null {
  try {
    const raw = sessionStorage.getItem(`${PREDICTIONS_STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) as CacheEntry<PredictionHistoryCacheValue> : null
  } catch {
    return null
  }
}

export function write_stored_predictions(key: string, entry: CacheEntry<PredictionHistoryCacheValue>) {
  try {
    sessionStorage.setItem(`${PREDICTIONS_STORAGE_PREFIX}${key}`, JSON.stringify(entry))
  } catch {
    return
  }
}

export function clear_stored_predictions() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREDICTIONS_STORAGE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key))
  } catch {
    return
  }
}

export function update_stored_matches_prediction(match_id: string, user_prediction: MatchListItem['user_prediction']) {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(MATCHES_STORAGE_PREFIX))
      .forEach((storageKey) => {
        const raw = sessionStorage.getItem(storageKey)
        if (!raw) return
        const entry = JSON.parse(raw) as CacheEntry<MatchListItem[]>
        if (!entry.value.some((match) => match.match_id === match_id)) return
        entry.value = entry.value.map((match) => match.match_id === match_id ? { ...match, user_prediction } : match)
        entry.updatedAt = Date.now()
        sessionStorage.setItem(storageKey, JSON.stringify(entry))
      })
  } catch {
    return
  }
}
