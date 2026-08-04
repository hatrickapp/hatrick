import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder } from '@/components/ui/avatar'
import { BackIconButton } from '@/components/shared/back_icon_button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as users_api from '@/api/users_api'
import { ROUTES } from '@/lib/constants'
import type { PublicUserSearchItem } from '@/types/user_types'

type SearchRouteState = {
  from?: string
}

function clean_query(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

function return_path(state: unknown): string {
  if (!state || typeof state !== 'object') return ROUTES.DASHBOARD_MATCHES

  const from = (state as SearchRouteState).from
  if (!from || from === ROUTES.DASHBOARD_SEARCH || from.startsWith(`${ROUTES.DASHBOARD_SEARCH}?`)) {
    return ROUTES.DASHBOARD_MATCHES
  }

  return from
}

export function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<PublicUserSearchItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canSearch = query.length >= 2
  const backPath = return_path(location.state)

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 220)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('hatrick-upgrade-lock')
    document.body.classList.add('hatrick-upgrade-lock')

    return () => {
      document.documentElement.classList.remove('hatrick-upgrade-lock')
      document.body.classList.remove('hatrick-upgrade-lock')
    }
  }, [])

  useEffect(() => {
    if (!canSearch) {
      setUsers([])
      setNextCursor(null)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      setLoading(true)
      users_api.search_users(query, null, controller.signal)
        .then((result) => {
          setUsers(result.users)
          setNextCursor(result.next_cursor)
        })
        .catch(() => undefined)
        .finally(() => setLoading(false))
    }, 220)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [canSearch, query])

  const loadMore = async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    try {
      const result = await users_api.search_users(query, nextCursor)
      setUsers((current) => [...current, ...result.users])
      setNextCursor(result.next_cursor)
    } finally {
      setLoading(false)
    }
  }

  const openProfile = (username: string) => {
    navigate(`/dashboard/users/${username}`, { state: { from: ROUTES.DASHBOARD_SEARCH } })
  }

  const dismissKeyboard = () => {
    inputRef.current?.blur()
  }

  return (
    <main className="fixed inset-0 z-[60] flex h-svh flex-col overflow-hidden overscroll-none bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1rem)] text-foreground animate-upgrade-page-in sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <div className="mb-5 flex">
          <BackIconButton onClick={() => navigate(backPath)} />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(clean_query(event.target.value))}
            placeholder="Search username"
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
          {!canSearch ? (
            <div className="flex min-h-[38vh] flex-col items-center justify-center px-4 py-10 text-center">
              <Search className="h-7 w-7 text-primary" />
              <p className="mt-4 text-sm font-medium">Start typing to find players.</p>
            </div>
          ) : users.length === 0 && !loading ? (
            <p className="px-2 py-8 text-center text-xs font-medium text-muted-foreground/50">
              No users found.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {users.map((user) => (
                <Button
                  key={user.user_id}
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full justify-start gap-3 rounded-none px-1 py-3 text-left shadow-none"
                  onClick={() => openProfile(user.username)}
                >
                  <Avatar className="h-10 w-10 border border-border/40">
                    <AvatarFallback>
                      <AvatarPlaceholder />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
                    {user.name && <p className="truncate text-xs text-muted-foreground/60">{user.name}</p>}
                  </div>
                </Button>
              ))}
              {nextCursor && (
                <div className="px-1 py-3">
                  <Button type="button" variant="outline" className="h-10 w-full shadow-none" disabled={loading} onClick={loadMore}>
                    {loading ? 'Loading' : 'More users'}
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
