import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarPlaceholder } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as users_api from '@/api/users_api'
import { cn } from '@/lib/utils'
import type { PublicUserSearchItem } from '@/types/user_types'

function clean_query(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

export function UserSearch({ compact = false, contained = false }: { compact?: boolean; contained?: boolean }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<PublicUserSearchItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const canSearch = query.length >= 2

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
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
          setOpen(true)
        })
        .catch(() => undefined)
        .finally(() => setLoading(false))
    }, 220)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [canSearch, query])

  const placeholder = useMemo(() => compact ? 'Search usernames' : 'Search users', [compact])

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
    setOpen(false)
    setQuery('')
    navigate(`/dashboard/users/${username}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
      <Input
        value={query}
        onChange={(event) => setQuery(clean_query(event.target.value))}
        onFocus={() => canSearch && setOpen(true)}
        placeholder={placeholder}
        className="h-9 rounded-lg border-border/50 bg-background pl-9 text-sm shadow-none"
      />

      {open && canSearch && (
        <div className={cn(
          "z-50 border-y border-border/40 bg-background py-2 shadow-sm",
          contained ? "relative mt-2" : "absolute left-0 right-0 top-11"
        )}>
          {users.length === 0 && !loading ? (
            <p className="px-3 py-4 text-center text-xs font-medium text-muted-foreground/60">No users found</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {users.map((user) => (
                <Button
                  key={user.user_id}
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full justify-start gap-3 rounded-none px-3 py-2 text-left shadow-none "
                  onClick={() => openProfile(user.username)}
                >
                  <Avatar className="h-8 w-8 border border-border/40">
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
                <div className="px-3 py-2">
                  <Button type="button" variant="outline" className="h-8 w-full shadow-none" disabled={loading} onClick={loadMore}>
                    {loading ? 'Loading' : 'More users'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
