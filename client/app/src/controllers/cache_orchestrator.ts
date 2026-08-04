import { load_billing_status } from '@/controllers/billing_controller'
import { load_profile } from '@/controllers/dashboard_controller'
import { get_cached_leagues_home, league_ids_from_home, load_league_detail, load_league_invitations, load_league_standings, load_leagues_config, load_leagues_home } from '@/controllers/leagues_controller'
import { load_prediction_history } from '@/controllers/predictions_controller'
import { get_cached_matches, load_competitions, load_match_detail, load_matches } from '@/controllers/sports_controller'

export const HATRICK_CACHE_UPDATED_EVENT = 'hatrick-cache-updated'

let silentRefreshInFlight: Promise<void> | null = null
let warmCacheInFlight: Promise<void> | null = null

function emit_cache_updated() {
  window.dispatchEvent(new Event(HATRICK_CACHE_UPDATED_EVENT))
}

export async function warm_hatrick_data_caches(force = false): Promise<void> {
  if (warmCacheInFlight) return warmCacheInFlight

  warmCacheInFlight = (async () => {
    const [matchesResult, leaguesHomeResult] = await Promise.allSettled([
      load_matches('today', undefined, force),
      load_leagues_home(force),
      load_competitions(force),
      load_prediction_history(null, force),
      load_leagues_config(force),
      load_league_invitations(force),
      load_profile(false, force),
      load_billing_status(force),
    ])

    const matchRows = matchesResult.status === 'fulfilled'
      ? matchesResult.value
      : get_cached_matches('today') ?? []
    const leaguesHome = leaguesHomeResult.status === 'fulfilled'
      ? leaguesHomeResult.value
      : get_cached_leagues_home()

    const leagueIds = league_ids_from_home(leaguesHome)
    await Promise.allSettled([
      ...matchRows.map((match) => load_match_detail(match.match_id, force)),
      ...leagueIds.map((leagueId) => load_league_detail(leagueId, force)),
      ...leagueIds.map((leagueId) => load_league_standings(leagueId, null, force)),
    ])
    emit_cache_updated()
  })().finally(() => {
    warmCacheInFlight = null
  })

  return warmCacheInFlight
}

export async function refresh_hatrick_caches_silently(): Promise<void> {
  if (silentRefreshInFlight) return silentRefreshInFlight
  silentRefreshInFlight = (async () => {
    await warm_hatrick_data_caches(true)
    emit_cache_updated()
  })().finally(() => {
    silentRefreshInFlight = null
  })
  return silentRefreshInFlight
}
