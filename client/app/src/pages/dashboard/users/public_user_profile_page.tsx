import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PublicProfileSkeleton } from '@/components/shared/dashboard_skeletons'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { PredictionRankIcon } from '@/components/shared/prediction_rank_icon'
import { ApiRequestError } from '@/api/client'
import {
  USERS_CACHE_UPDATED_EVENT,
  get_cached_public_user_profile,
  load_public_user_profile,
  set_public_user_follow,
} from '@/controllers/users_controller'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { RankingAccuracyItem } from '@/types/prediction_types'
import type { PublicUserProfileResponse, UserProfileRank } from '@/types/user_types'

function Metric({ label, value, green = false }: { label: string; value: string | number; green?: boolean }) {
  return (
    <div className="border-t border-border/30 pt-3 sm:pt-4">
      <p className={green ? 'text-xl font-semibold text-primary sm:text-2xl' : 'text-xl font-semibold text-foreground sm:text-2xl'}>{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] sm:tracking-widest text-muted-foreground/60 sm:text-xs">{label}</p>
    </div>
  )
}

function format_count(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function format_percent(value: number): string {
  return value % 1 === 0 ? `${value.toFixed(0)}%` : `${value.toFixed(1)}%`
}

function clamp_percent(value: number): number {
  return Math.min(Math.max(value, 0), 100)
}

function accuracy_from_ranking(ranking: PublicUserProfileResponse['ranking']): RankingAccuracyItem[] {
  const total = ranking.settled_predictions
  const row = (key: RankingAccuracyItem['key'], label: string, correct: number): RankingAccuracyItem => ({
    key,
    label,
    correct,
    total,
    ratio_percent: total ? Math.round((correct / total) * 1000) / 10 : 0,
  })
  return [
    row('winner_draw', 'Winners', ranking.correct_outcomes),
    row('btts', 'Both To Score', ranking.correct_btts),
    row('scorer', 'Scorers', ranking.correct_scorers),
    row('hatrick', 'Hatricks', ranking.hatricks),
  ]
}

function PredictionRankStat({
  rank,
  nextRank,
  totalPoints,
  pointsToNext,
}: {
  rank: UserProfileRank | null
  nextRank: UserProfileRank | null
  totalPoints: number
  pointsToNext: number | null
}) {
  if (!rank) {
    return (
      <div className="border-t border-border/30 pt-4 sm:pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Prediction Rank</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Rank data appears after prediction ranks are seeded.</p>
      </div>
    )
  }

  const progress = nextRank
    ? Math.max(0, Math.min(100, ((totalPoints - rank.min_points) / (nextRank.min_points - rank.min_points)) * 100))
    : 100

  return (
    <div className="border-t border-border/30 pt-4 sm:pt-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Prediction Rank</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <PredictionRankIcon rank={rank} className="h-11 w-11 sm:h-9 sm:w-9" />
          <div className="min-w-0">
            <p className="text-base font-medium tracking-tight text-foreground sm:text-lg">{rank.name}</p>
            <p className="mt-1 text-xs text-muted-foreground/60">{totalPoints} points</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest text-muted-foreground/60">Next</p>
          <p className="mt-1 text-sm font-medium tracking-tight text-foreground">{nextRank?.name ?? 'Top'}</p>
        </div>
      </div>
      <div className="mt-4 h-2 bg-border/50">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-4 text-xs font-medium leading-5 text-muted-foreground">
        {nextRank && pointsToNext !== null
          ? `${pointsToNext} points left`
          : 'Top rank reached'}
      </p>
    </div>
  )
}

function AccuracyColumn({ item }: { item: RankingAccuracyItem }) {
  const percent = clamp_percent(item.ratio_percent)

  return (
    <div className="flex min-w-0 flex-col items-center border-t border-border/30 pt-4">
      <p className="text-base font-semibold tabular-nums text-primary">{format_percent(item.ratio_percent)}</p>
      <div className="mt-4 flex h-28 items-end">
        <div className="flex h-full w-7 items-end bg-border/50">
          <div className="w-full bg-primary transition-all" style={{ height: `${percent}%` }} />
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-medium leading-4 text-foreground">{item.label}</p>
      <p className="mt-1 text-center text-xs text-muted-foreground/60">{item.correct} / {item.total} correct</p>
    </div>
  )
}

export function PublicUserProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const currentProfile = use_dashboard_store((store) => store.profile)
  const [state, setState] = useState<{
    username: string | null
    profile: PublicUserProfileResponse | null
    error: string | null
  }>({ username: null, profile: null, error: null })
  const [followLoading, setFollowLoading] = useState(false)
  const followLoadingRef = useRef(false)

  useEffect(() => {
    if (!username) return
    const cached = get_cached_public_user_profile(username)
    if (cached) {
      setState({ username, profile: cached, error: null })
    }

    let cancelled = false
    load_public_user_profile(username)
      .then((profile) => {
        if (!cancelled) setState({ username, profile, error: null })
      })
      .catch((error) => {
        if (cancelled) return
        const message = error instanceof ApiRequestError && error.code === 'NOT_FOUND'
          ? 'This username is not available publicly'
          : 'Could not load this profile'
        setState({ username, profile: null, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    if (!username) return
    const activeUsername = username

    function syncFromCache() {
      if (followLoading) return
      const cached = get_cached_public_user_profile(activeUsername)
      if (cached) setState({ username: activeUsername, profile: cached, error: null })
    }

    window.addEventListener(USERS_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(USERS_CACHE_UPDATED_EVENT, syncFromCache)
  }, [followLoading, username])

  if (!username || state.username !== username) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="mx-auto flex w-full flex-col px-4 pb-8 pt-5 sm:px-6 sm:py-8">
          <PublicProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!state.profile) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="mx-auto px-4 py-14 text-center sm:px-6 sm:py-16">
          <p className="text-sm font-medium text-foreground">{state.error === 'Could not load this profile' ? 'Profile unavailable' : 'User not found'}</p>
          <p className="mt-2 text-sm text-muted-foreground/60">{state.error}</p>
        </div>
      </div>
    )
  }

  const profile = state.profile
  const ranking = profile.ranking
  const accuracy = profile.accuracy?.length ? profile.accuracy : accuracy_from_ranking(ranking)
  const bestPick = accuracy
    .filter((item) => item.key !== 'hatrick' && item.total > 0)
    .sort((left, right) => right.ratio_percent - left.ratio_percent || right.correct - left.correct)[0] ?? null
  const isOwnProfile = currentProfile?.user_id === profile.user_id

  async function toggleFollow() {
    if (isOwnProfile || followLoadingRef.current) return
    followLoadingRef.current = true
    setFollowLoading(true)
    try {
      await set_public_user_follow(profile, !profile.is_following)
      const nextProfile = await load_public_user_profile(profile.username, true)
      setState((current) => ({ ...current, profile: nextProfile }))
    } finally {
      followLoadingRef.current = false
      setFollowLoading(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto w-full space-y-6 px-4 pb-8 pt-4 animate-in fade-in duration-500 sm:space-y-8 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-5 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:pb-2">
        <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 sm:flex sm:items-center sm:gap-8">
        <Avatar className="h-20 w-20 border border-border shadow-none sm:h-28 sm:w-28">
          <AvatarFallback>
            <AvatarPlaceholder />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3">
            <h1 className="min-w-0 break-words text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl">@{profile.username}</h1>
            {profile.plan === 'plus' && <Sparkles className="h-5 w-5 shrink-0 text-[#D4AF37] sm:h-6 sm:w-6" aria-label="Plus user" />}
          </div>
          {profile.name && <p className="mt-2 text-sm font-medium text-muted-foreground">{profile.name}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4 sm:gap-x-5">
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-left text-xs text-muted-foreground shadow-none"
              onClick={() => navigate(`/dashboard/users/${profile.username}/follows?tab=followers`)}
            >
              <span className="font-semibold text-foreground">{format_count(profile.followers_count)}</span> followers
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-left text-xs text-muted-foreground shadow-none"
              onClick={() => navigate(`/dashboard/users/${profile.username}/follows?tab=following`)}
            >
              <span className="font-semibold text-foreground">{format_count(profile.following_count)}</span> following
            </Button>
          </div>
        </div>
        </div>
        {!isOwnProfile && (
          <Button
            type="button"
            variant={profile.is_following ? 'outline' : 'default'}
            disabled={followLoading}
            className={`h-10 min-w-28 self-start sm:self-auto ${!profile.is_following && profile.plan === 'plus' ? 'border-black bg-[#D4AF37] text-foreground' : ''}`}
            onPointerDown={(event) => {
              event.preventDefault()
              void toggleFollow()
            }}
            onClick={(event) => {
              event.preventDefault()
              void toggleFollow()
            }}
          >
            {followLoading ? <LoadingSpinner size="sm" /> : profile.is_following ? 'Following' : 'Follow'}
          </Button>
        )}
      </section>

      <section className="border-y border-border/40 py-4 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:mb-6 sm:gap-x-6">
          <p>
            <span className="font-semibold text-foreground">#{ranking.global_rank}</span> Global Rank
          </p>
          <p>
            <span className="font-semibold text-foreground">{ranking.best_global_rank ? `#${ranking.best_global_rank}` : `#${ranking.global_rank}`}</span> Best Ever Rank
          </p>
        </div>
        <PredictionRankStat
          rank={profile.rank}
          nextRank={profile.next_rank}
          totalPoints={ranking.points}
          pointsToNext={profile.points_to_next_rank}
        />
        <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-3">
        <Metric label="Points" value={ranking.points} green />
        <Metric label="Predictions" value={ranking.predictions_count} green />
        <Metric label="Winners" value={ranking.correct_outcomes} green />
        <Metric label="Both To Score" value={ranking.correct_btts} green />
        <Metric label="Hatricks" value={ranking.hatricks} green />
        <Metric label="Scorers" value={ranking.correct_scorers} green />
        </div>
      </section>

      <section className="border-b border-border/40 pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 sm:text-xs sm:tracking-widest">Prediction Accuracy</p>
            <h2 className="mt-2 text-base font-medium tracking-tight">Best ratio by pick type</h2>
          </div>
          {bestPick && (
            <p className="text-sm text-muted-foreground">
              Best: <span className="font-semibold text-primary">{bestPick.label}</span>
            </p>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
          {accuracy.map((item) => (
            <AccuracyColumn key={item.key} item={item} />
          ))}
        </div>
      </section>
      </div>
    </div>
  )
}
