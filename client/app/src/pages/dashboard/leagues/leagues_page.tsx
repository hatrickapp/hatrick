import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LeaguesSkeleton } from '@/components/shared/dashboard_skeletons'
import { ErrorAlert } from '@/components/shared/error_alert'
import { HATRICK_CACHE_UPDATED_EVENT } from '@/controllers/cache_orchestrator'
import { get_cached_leagues_config, get_cached_league_detail, get_cached_league_invitations, get_cached_league_standings, get_cached_leagues_home, join_hatrick_league_invitation, leave_hatrick_league, load_league_invitations, load_leagues_config, load_league_detail, load_league_standings, load_leagues_home, remove_hatrick_league_member, reject_hatrick_league_invitation } from '@/controllers/leagues_controller'
import { load_competitions } from '@/controllers/sports_controller'
import { load_profile } from '@/controllers/dashboard_controller'
import { cn } from '@/lib/utils'
import { use_dashboard_store } from '@/store/dashboard_store'
import { use_ui_store } from '@/store/ui_store'
import type { LeagueInvitationItem, LeagueStandingItem, LeagueSummaryItem, LeaguesConfigResponse, LeaguesHomeResponse } from '@/types/league_types'
import type { CompetitionItem } from '@/types/sports_types'
import { CreateLeagueForm } from './components/create_league_form'
import { LeagueInvitations } from './components/league_invitations'
import { LeagueSettings } from './components/league_settings'
import { MyLeagues } from './components/my_leagues'

type Mode = 'overview' | 'create' | 'settings' | 'invitations'
type LeagueTab = 'created' | 'joined' | 'finished'

export function LeaguesPage() {
  const location = useLocation()
  const profile = use_dashboard_store((s) => s.profile)
  const setTopNavBack = use_ui_store((s) => s.set_top_nav_back)
  const setHideTopNavSearch = use_ui_store((s) => s.set_hide_top_nav_search)
  const cachedHome = get_cached_leagues_home()
  const cachedConfig = get_cached_leagues_config()
  const cachedInvitations = get_cached_league_invitations()
  const [mode, setMode] = useState<Mode>('overview')
  const [leagueTab, setLeagueTab] = useState<LeagueTab>('created')
  const [home, setHome] = useState<LeaguesHomeResponse | null>(cachedHome)
  const [config, setConfig] = useState<LeaguesConfigResponse | null>(cachedConfig)
  const [invitations, setInvitations] = useState<LeagueInvitationItem[]>(cachedInvitations?.invitations ?? [])
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([])
  const [selectedLeague, setSelectedLeague] = useState<LeagueSummaryItem | null>(null)
  const [standings, setStandings] = useState<LeagueStandingItem[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(!cachedInvitations)
  const [joiningInvitationId, setJoiningInvitationId] = useState<string | null>(null)
  const [rejectingInvitationId, setRejectingInvitationId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cachedHome || !cachedConfig)
  const [loadingStandings, setLoadingStandings] = useState(false)
  const [leavingLeagueId, setLeavingLeagueId] = useState<string | null>(null)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ((location.state as { mode?: Mode } | null)?.mode === 'create') setMode('create')
  }, [location.state])

  useEffect(() => {
    if (!profile) load_profile().catch(() => undefined)
  }, [profile])

  useEffect(() => {
    setHideTopNavSearch(mode === 'settings')
    if (mode === 'create' || mode === 'settings' || mode === 'invitations') {
      setTopNavBack(() => {
        if (mode === 'settings') {
          setSelectedLeague(null)
          setStandings([])
          setLoadingStandings(false)
        }
        setMode('overview')
      })
      return () => {
        setTopNavBack(null)
        setHideTopNavSearch(false)
      }
    }
    setTopNavBack(null)
    return () => setHideTopNavSearch(false)
  }, [mode, setHideTopNavSearch, setTopNavBack])

  useEffect(() => {
    let cancelled = false
    Promise.all([load_leagues_home(), load_competitions(), load_leagues_config(), load_league_invitations()])
      .then(([homeResponse, competitionRows, configResponse, invitationsResponse]) => {
        if (cancelled) return
        setHome(homeResponse)
        setCompetitions(competitionRows)
        setConfig(configResponse)
        setInvitations(invitationsResponse.invitations)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load leagues.')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setLoadingInvitations(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedLeagueId = selectedLeague?.league_id ?? null

  useEffect(() => {
    const syncFromCache = () => {
      const cached = get_cached_leagues_home()
      const cachedLeagueConfig = get_cached_leagues_config()
      const cachedLeagueInvitations = get_cached_league_invitations()
      if (cached) setHome(cached)
      if (cachedLeagueConfig) setConfig(cachedLeagueConfig)
      if (cachedLeagueInvitations) setInvitations(cachedLeagueInvitations.invitations)
      if (selectedLeagueId) {
        const cachedDetail = get_cached_league_detail(selectedLeagueId)
        const cachedStandings = get_cached_league_standings(selectedLeagueId)
        if (cachedDetail) setSelectedLeague(cachedDetail.league)
        if (cachedStandings) setStandings(cachedStandings.standings)
      }
    }
    window.addEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(HATRICK_CACHE_UPDATED_EVENT, syncFromCache)
  }, [selectedLeagueId])

  useEffect(() => {
    if (!selectedLeagueId) return
    let cancelled = false
    load_league_standings(selectedLeagueId)
      .then((response) => {
        if (!cancelled) setStandings(response.standings)
      })
      .catch(() => {
        if (!cancelled) setStandings([])
      })
      .finally(() => {
        if (!cancelled) setLoadingStandings(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedLeagueId])

  const activeLeagues = useMemo(() => home?.active_leagues ?? [], [home])
  const historyLeagues = useMemo(() => home?.history_leagues ?? [], [home])
  const createdLeagues = useMemo(() => activeLeagues.filter((league) => league.is_host), [activeLeagues])
  const joinedLeagues = useMemo(() => activeLeagues.filter((league) => !league.is_host), [activeLeagues])
  const canCreate = useMemo(() => {
    if (!profile || !config) return true
    const hostedActive = activeLeagues.filter((league) => league.is_host).length
    const planLimits = config.plan_limits[profile.plan]
    return !planLimits || hostedActive < planLimits.active_league_limit
  }, [activeLeagues, config, profile])

  async function selectLeague(league: LeagueSummaryItem) {
    if (mode === 'overview' && selectedLeague?.league_id === league.league_id) {
      setSelectedLeague(null)
      setStandings([])
      setLoadingStandings(false)
      return
    }
    setMode('overview')
    const cachedDetail = get_cached_league_detail(league.league_id)
    const cachedStandings = get_cached_league_standings(league.league_id)
    setSelectedLeague(cachedDetail?.league ?? league)
    setStandings(cachedStandings?.standings ?? [])
    setLoadingStandings(!cachedStandings)
    try {
      const response = await load_league_detail(league.league_id)
      setSelectedLeague(response.league)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load league.')
    }
  }

  async function openLeagueSettings(league: LeagueSummaryItem) {
    if (!league.is_host) return
    setMode('settings')
    const cachedDetail = get_cached_league_detail(league.league_id)
    setSelectedLeague(cachedDetail?.league ?? league)
    try {
      const response = await load_league_detail(league.league_id)
      setSelectedLeague(response.league)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load league.')
    }
  }

  function setCreatedOrJoined(league: LeagueSummaryItem) {
    setSelectedLeague(league)
    setLoadingStandings(true)
    setLeagueTab(league.is_host ? 'created' : 'joined')
    setMode('overview')
    load_leagues_home(true).then(setHome).catch(() => undefined)
  }

  function setUpdated(league: LeagueSummaryItem) {
    if (league.status === 'deleted') {
      setSelectedLeague(null)
      setStandings([])
      setLoadingStandings(false)
      setMode('overview')
      load_leagues_home(true).then(setHome).catch(() => undefined)
      return
    }
    setSelectedLeague(league)
    setLoadingStandings(false)
    load_leagues_home(true).then(setHome).catch(() => undefined)
  }

  async function openInvitations() {
    setMode('invitations')
    setJoinError(null)
    setLoadingInvitations(true)
    try {
      const response = await load_league_invitations(true)
      setInvitations(response.invitations)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not load invitations.')
    } finally {
      setLoadingInvitations(false)
    }
  }

  async function joinInvitation(invitation: LeagueInvitationItem) {
    setJoiningInvitationId(invitation.league_invitation_id)
    setJoinError(null)
    try {
      const response = await join_hatrick_league_invitation(invitation.league_invitation_id)
      const [homeResponse, invitationsResponse] = await Promise.all([
        load_leagues_home(true),
        load_league_invitations(true),
      ])
      setHome(homeResponse)
      setInvitations(invitationsResponse.invitations)
      setLeagueTab('joined')
      setCreatedOrJoined(response.league)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join league.')
    } finally {
      setJoiningInvitationId(null)
    }
  }

  async function rejectInvitation(invitation: LeagueInvitationItem) {
    setRejectingInvitationId(invitation.league_invitation_id)
    setJoinError(null)
    try {
      await reject_hatrick_league_invitation(invitation.league_invitation_id)
      const response = await load_league_invitations(true)
      setInvitations(response.invitations)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not reject invitation.')
    } finally {
      setRejectingInvitationId(null)
    }
  }

  async function handleLeaveLeague(league: LeagueSummaryItem) {
    setLeavingLeagueId(league.league_id)
    setError(null)
    try {
      await leave_hatrick_league(league.league_id)
      if (selectedLeague?.league_id === league.league_id) {
        setSelectedLeague(null)
        setStandings([])
        setLoadingStandings(false)
      }
      const response = await load_leagues_home(true)
      setHome(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not leave league.')
    } finally {
      setLeavingLeagueId(null)
    }
  }

  async function handleRemoveLeagueMember(memberUserId: string) {
    if (!selectedLeague) return
    setRemovingUserId(memberUserId)
    setError(null)
    try {
      const response = await remove_hatrick_league_member(selectedLeague.league_id, memberUserId)
      setSelectedLeague(response.league)
      setLoadingStandings(true)
      const [homeResponse, standingsResponse] = await Promise.all([
        load_leagues_home(true),
        load_league_standings(selectedLeague.league_id, null, true),
      ])
      setHome(homeResponse)
      setStandings(standingsResponse.standings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member.')
    } finally {
      setLoadingStandings(false)
      setRemovingUserId(null)
    }
  }

  const pageTitle = mode === 'create' ? 'Create League' : mode === 'settings' ? 'League Settings' : mode === 'invitations' ? 'League Invitations' : 'Leagues'
  const pageDescription =
    mode === 'create'
      ? 'Choose the competitions, scoring, period, and winning rule.'
      : mode === 'settings'
        ? 'Host controls for invite, status, and end date.'
        : mode === 'invitations'
          ? 'Review league invites and join when you are ready.'
          : 'Create private prediction leagues, join by invitation, and track standings as matches settle.'
  const mobilePageDescription =
    mode === 'overview'
      ? 'Create private leagues, join by invitation, and compete.'
      : pageDescription

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-background">
      <div className={cn('mx-auto flex w-full flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5 sm:px-6 sm:pb-8 sm:pt-8', mode === 'overview' ? 'gap-8' : mode === 'settings' ? 'gap-1' : 'gap-4')}>
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-2xl font-medium tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground/60 sm:hidden">{mobilePageDescription}</p>
          <p className="mt-2 hidden text-sm text-muted-foreground/60 sm:block">{pageDescription}</p>
        </div>

        {loading ? (
          <LeaguesSkeleton />
        ) : error ? (
          <div className="border-y border-border/40 py-10">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : (
          <div className="grid gap-8">
            <main className="min-w-0">
              {mode === 'create' && config ? (
                <CreateLeagueForm
                  competitions={competitions}
                  canCreate={canCreate}
                  planLimits={config.plan_limits[profile?.plan ?? 'free']}
                  leagueLimits={config.league_limits}
                  scoringPresets={config.scoring_presets}
                  onCreated={setCreatedOrJoined}
                />
              ) : mode === 'settings' && selectedLeague?.is_host && config ? (
                <LeagueSettings league={selectedLeague} leagueLimits={config.league_limits} onUpdated={setUpdated} />
              ) : mode === 'invitations' ? (
                <LeagueInvitations
                  invitations={invitations}
                  loading={loadingInvitations}
                  joiningInvitationId={joiningInvitationId}
                  rejectingInvitationId={rejectingInvitationId}
                  error={joinError}
                  onJoin={joinInvitation}
                  onReject={rejectInvitation}
                  onClearError={() => setJoinError(null)}
                />
              ) : (
                <MyLeagues
                  createdLeagues={createdLeagues}
                  joinedLeagues={joinedLeagues}
                  finishedLeagues={historyLeagues}
                  activeId={selectedLeague?.league_id}
                  selectedLeague={selectedLeague}
                  standings={standings}
                  loadingStandings={loadingStandings}
                  leavingLeagueId={leavingLeagueId}
                  removingUserId={removingUserId}
                  tab={leagueTab}
                  onTabChange={setLeagueTab}
                  onCreate={() => setMode('create')}
                  onToggleJoin={openInvitations}
                  onSelect={selectLeague}
                  onSettings={openLeagueSettings}
                  onLeave={handleLeaveLeague}
                  onRemoveMember={handleRemoveLeagueMember}
                />
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
