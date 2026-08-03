import type { NavigateFunction } from 'react-router-dom'
import { ROUTES } from './constants'

type UpgradeRouteState = {
  from?: string
  leaguesMode?: 'create'
  upgradePresentation?: 'slide-up'
}

const UPGRADE_RETURN_PATH_KEY = 'hatrick-upgrade-return-path'
const UPGRADE_LEAGUES_MODE_KEY = 'hatrick-upgrade-leagues-mode'

export function navigate_to_upgrade(navigate: NavigateFunction, state: Pick<UpgradeRouteState, 'leaguesMode'> = {}) {
  const from = `${window.location.pathname}${window.location.search}${window.location.hash}`
  sessionStorage.setItem(UPGRADE_RETURN_PATH_KEY, from)
  if (state.leaguesMode) sessionStorage.setItem(UPGRADE_LEAGUES_MODE_KEY, state.leaguesMode)
  else sessionStorage.removeItem(UPGRADE_LEAGUES_MODE_KEY)
  navigate(ROUTES.DASHBOARD_UPGRADE, {
    state: {
      from,
      ...state,
      upgradePresentation: 'slide-up',
    } satisfies UpgradeRouteState,
  })
}

export function get_upgrade_return_path(state: unknown) {
  const saved = sessionStorage.getItem(UPGRADE_RETURN_PATH_KEY)
  if (!state || typeof state !== 'object') return saved ?? ROUTES.DASHBOARD_LEAGUES

  const from = (state as UpgradeRouteState).from
  if (!from || from === ROUTES.DASHBOARD_UPGRADE || from.startsWith(`${ROUTES.DASHBOARD_UPGRADE}?`)) {
    return saved ?? ROUTES.DASHBOARD_LEAGUES
  }

  return from
}

export function get_upgrade_return_state(state: unknown) {
  const leaguesMode =
    state && typeof state === 'object'
      ? ((state as UpgradeRouteState).leaguesMode ?? sessionStorage.getItem(UPGRADE_LEAGUES_MODE_KEY))
      : sessionStorage.getItem(UPGRADE_LEAGUES_MODE_KEY)
  return leaguesMode === 'create' ? { mode: 'create' } : undefined
}
