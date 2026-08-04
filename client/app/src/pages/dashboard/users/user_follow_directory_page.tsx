import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing } from '@/components/ui/avatar'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { SettingsListSkeleton } from '@/components/shared/dashboard_skeletons'
import { SegmentedControl } from '@/components/shared/segmented_control'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  USERS_CACHE_UPDATED_EVENT,
  get_cached_follow_list,
  get_cached_public_user_profile,
  load_follow_list,
  load_public_user_profile,
} from '@/controllers/users_controller'
import { ROUTES } from '@/lib/constants'
import type { FollowUserItem, PublicUserProfileResponse } from '@/types/user_types'

type FollowMode = 'followers' | 'following'

function clean_query(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

function format_count(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function mode_from_params(value: string | null): FollowMode {
  return value === 'following' ? 'following' : 'followers'
}

export function UserFollowDirectoryPage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<PublicUserProfileResponse | null>(
    username ? get_cached_public_user_profile(username) : null,
  )
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<FollowUserItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mode = mode_from_params(searchParams.get('tab'))
  const backPath = username ? `/dashboard/users/${username}` : ROUTES.DASHBOARD_MATCHES

  useEffect(() => {
    document.documentElement.classList.add('hatrick-upgrade-lock')
    document.body.classList.add('hatrick-upgrade-lock')
    window.setTimeout(() => inputRef.current?.focus(), 260)

    return () => {
      document.documentElement.classList.remove('hatrick-upgrade-lock')
      document.body.classList.remove('hatrick-upgrade-lock')
    }
  }, [])

  useEffect(() => {
    if (!username) return
    const cached = get_cached_public_user_profile(username)
    if (cached) setProfile(cached)

    let cancelled = false
    load_public_user_profile(username)
      .then((result) => {
        if (!cancelled) setProfile(result)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    if (!username) return
    const controller = new AbortController()
    const cached = get_cached_follow_list(username, mode, query, null)

    if (cached) {
      setUsers(cached.users)
      setNextCursor(cached.next_cursor)
      setLoading(false)
    } else {
      setLoading(true)
    }

    const timeout = window.setTimeout(() => {
      load_follow_list(username, mode, query, null, false, controller.signal)
        .then((response) => {
          setUsers(response.users)
          setNextCursor(response.next_cursor)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setUsers([])
            setNextCursor(null)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 220)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [mode, query, username])

  useEffect(() => {
    if (!username) return
    const activeUsername = username

    function syncFromCache() {
      const cachedProfile = get_cached_public_user_profile(activeUsername)
      const cachedList = get_cached_follow_list(activeUsername, mode, query, null)

      if (cachedProfile) setProfile(cachedProfile)
      if (cachedList) {
        setUsers(cachedList.users)
        setNextCursor(cachedList.next_cursor)
      }
    }

    window.addEventListener(USERS_CACHE_UPDATED_EVENT, syncFromCache)
    return () => window.removeEventListener(USERS_CACHE_UPDATED_EVENT, syncFromCache)
  }, [mode, query, username])

  async function loadMore() {
    if (!username || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const response = await load_follow_list(username, mode, query, nextCursor)
      setUsers((current) => [...current, ...response.users])
      setNextCursor(response.next_cursor)
    } finally {
      setLoadingMore(false)
    }
  }

  function setMode(nextMode: FollowMode) {
    setSearchParams({ tab: nextMode }, { replace: true })
    setQuery('')
  }

  function dismissKeyboard() {
    inputRef.current?.blur()
  }

  return (
    <main className="fixed inset-0 z-[60] flex h-svh flex-col overflow-hidden overscroll-none bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1rem)] text-foreground animate-upgrade-page-in sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <div className="mb-5 flex">
          <BackIconButton onClick={() => navigate(backPath)} />
        </div>

        <SegmentedControl
          items={[
            {
              value: 'followers',
              label: `Followers (${format_count(profile?.followers_count ?? 0)})`,
            },
            {
              value: 'following',
              label: `Following (${format_count(profile?.following_count ?? 0)})`,
            },
          ]}
          value={mode}
          onValueChange={setMode}
          columns={2}
          itemClassName="min-h-11 px-3 text-sm"
        />

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(clean_query(event.target.value))}
            placeholder="Search usernames"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            inputMode="search"
            className="h-11 w-full rounded-none border-border/50 bg-background pl-9 text-base shadow-none"
          />
        </div>

        <section
          className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/30"
          onScroll={dismissKeyboard}
          onTouchMove={dismissKeyboard}
        >
          {loading ? (
            <SettingsListSkeleton />
          ) : users.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium">No users found</p>
              <p className="mt-2 text-xs text-muted-foreground/60">Public accounts will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {users.map((user) => (
                <Button
                  key={`${mode}-${user.user_id}`}
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full justify-start gap-3 rounded-none px-1 py-3 text-left shadow-none"
                  onClick={() => navigate(`/dashboard/users/${user.username}`)}
                >
                  <PlusAvatarRing active={user.plan === 'plus'}>
                    <Avatar className="h-10 w-10 border border-border shadow-none">
                      <AvatarFallback>
                        <AvatarPlaceholder />
                      </AvatarFallback>
                    </Avatar>
                  </PlusAvatarRing>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium tracking-tight text-foreground">{user.username}</span>
                    {user.name && <span className="mt-1 block truncate text-xs text-muted-foreground">{user.name}</span>}
                  </span>
                  {user.is_following && <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Following</span>}
                </Button>
              ))}
              {nextCursor && (
                <div className="px-1 py-3">
                  <Button type="button" variant="outline" className="h-10 w-full shadow-none" disabled={loadingMore} onClick={loadMore}>
                    {loadingMore ? 'Loading' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
