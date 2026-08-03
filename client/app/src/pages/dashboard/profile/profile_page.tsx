import { useEffect, useState } from 'react'
import { AtSign, BadgeCheck, CalendarDays, Check, Eye, Globe2, KeyRound, Pencil, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, AvatarPlaceholder } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileSkeleton } from '@/components/shared/dashboard_skeletons'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { handle_update_profile_name, handle_update_profile_timezone, handle_update_profile_username, handle_update_profile_visibility, load_profile } from '@/controllers/dashboard_controller'
import { is_valid_username, sanitize_username_input } from '@/lib/username_validation'
import { use_dashboard_store } from '@/store/dashboard_store'

const TIMEZONES = [
  'UTC',
  'Asia/Amman',
  'Asia/Riyadh',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
]

function format_date(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function provider_label(provider: string): string {
  const labels: Record<string, string> = {
    google: 'Google',
    apple: 'Apple',
  }
  return labels[provider] ?? provider
}

function account_status_label(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

function format_count(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function is_valid_profile_name(name: string): boolean {
  const cleaned = name.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 5 || cleaned.length > 128 || !/^[A-Za-z][A-Za-z .'-]*$/.test(cleaned)) return false

  const parts = cleaned.split(' ')
  if (parts.length < 2) return false

  return parts.every((part) => {
    const lettersOnly = part.replace(/[.'-]/g, '')
    return lettersOnly.length >= 2 && /^[A-Za-z]+(?:[.'-][A-Za-z]+)*$/.test(part)
  })
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-2 py-4 group sm:flex-row sm:items-center sm:justify-between sm:py-3">
      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] sm:tracking-widest text-muted-foreground/60 sm:text-xs">
        <span className="text-muted-foreground/30  transition-colors">{icon}</span>
        {label}
      </div>
      <div className="break-words text-left text-sm font-medium text-foreground sm:text-right">{value}</div>
    </div>
  )
}

function VisibilityChoice({
  value,
  selected,
  disabled,
  onSelect,
}: {
  value: 'Yes' | 'No'
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onSelect}
      className={[
        'min-w-24 rounded-none border-border/60 px-5 py-2 text-sm font-medium shadow-none',
        selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground ',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      {value}
    </Button>
  )
}

export function ProfilePage() {
  const profile = use_dashboard_store((s) => s.profile)
  const [loading, set_loading] = useState(true)
  const [nameEditing, setNameEditing] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [usernameEditing, setUsernameEditing] = useState(false)
  const [usernameValue, setUsernameValue] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [timezoneLoading, setTimezoneLoading] = useState(false)
  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    load_profile().finally(() => set_loading(false))
  }, [])

  useEffect(() => {
    if (profile) {
      setNameValue(profile.name ?? '')
      setUsernameValue(profile.username)
      if (profile.plan !== 'plus') setUsernameEditing(false)
    }
  }, [profile])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="py-8">
        <p className="text-xs text-muted-foreground">Failed to load account profile.</p>
      </div>
    )
  }

  const avatarSrc = profile.avatar_url ?? null
  const canEditName = profile.provider === 'google' || profile.provider === 'apple' || !profile.name
  const usernameNextChangeAt = profile.username_next_change_at ? new Date(profile.username_next_change_at) : null
  const canChangeUsername = profile.plan === 'plus'
  const canEditUsername = canChangeUsername && (!usernameNextChangeAt || usernameNextChangeAt <= new Date())

  const submitName = async (event: React.FormEvent) => {
    event.preventDefault()
    setProfileError(null)
    if (!is_valid_profile_name(nameValue)) {
      setProfileError('Enter a valid full name with at least two name parts.')
      return
    }
    setNameLoading(true)
    try {
      await handle_update_profile_name(nameValue)
      setNameEditing(false)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not update your name.')
    } finally {
      setNameLoading(false)
    }
  }

  const updateTimezone = async (timezone: string) => {
    if (timezone === profile.timezone) return
    setTimezoneLoading(true)
    setProfileError(null)
    try {
      await handle_update_profile_timezone(timezone)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not update your timezone.')
    } finally {
      setTimezoneLoading(false)
    }
  }

  const updateVisibility = async (showName: boolean) => {
    if (showName === profile.show_name_publicly) return
    setVisibilityLoading(true)
    setProfileError(null)
    try {
      await handle_update_profile_visibility(showName)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not update public profile settings.')
    } finally {
      setVisibilityLoading(false)
    }
  }

  const submitUsername = async (event: React.FormEvent) => {
    event.preventDefault()
    setProfileError(null)
    if (!canChangeUsername) {
      setProfileError('Username changes are available with Hatrick Plus.')
      return
    }
    if (!is_valid_username(usernameValue)) {
      setProfileError('Use 3 to 20 lowercase letters, numbers, or underscores with no offensive words.')
      return
    }
    setUsernameLoading(true)
    try {
      await handle_update_profile_username(usernameValue)
      setUsernameEditing(false)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not update your username.')
    } finally {
      setUsernameLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium tracking-tight">Account Profile</h2>
        <p className="text-sm text-muted-foreground/60">Manage the account details used for sign-in and security.</p>
      </div>
      <div className="border-t border-border/40" />

      <div className="flex items-center gap-4 py-2 sm:gap-6 sm:py-4">
        <div className="flex shrink-0 flex-col items-start gap-2 sm:w-24 sm:items-center">
          <Avatar key={avatarSrc ?? 'empty-profile-avatar'} className="h-16 w-16 border border-border shadow-none sm:h-20 sm:w-20">
            {avatarSrc && (
              <AvatarImage src={avatarSrc} alt={profile.name ?? profile.email} />
            )}
            <AvatarFallback>
              <AvatarPlaceholder />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="min-w-0 break-words text-lg font-medium tracking-tight text-foreground sm:text-xl">{profile.name || profile.email.split('@')[0]}</h3>
          </div>
          <p className="break-words text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{format_count(profile.followers_count)}</span> followers
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{format_count(profile.following_count)}</span> following
            </p>
          </div>
        </div>
      </div>
      <ErrorAlert message={profileError} onDismiss={() => setProfileError(null)} />

      <div className="grid gap-8">
        <div>
          <div className="divide-y divide-border/30">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={nameEditing ? (
                <form onSubmit={submitName} className="flex w-full max-w-sm items-center gap-2 sm:ml-auto">
                  <Input
                    value={nameValue}
                    onChange={(event) => setNameValue(event.target.value.replace(/[^A-Za-z .'-]/g, ''))}
                    maxLength={128}
                    className="h-9 bg-input-background text-left"
                    autoFocus
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={nameLoading || !is_valid_profile_name(nameValue)}>
                    {nameLoading ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={nameLoading}
                    onClick={() => {
                      setNameValue(profile.name ?? '')
                      setNameEditing(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  {profile.name && <span>{profile.name}</span>}
                  {canEditName && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="inline-flex h-6 w-6 items-center justify-center text-primary transition-colors "
                      aria-label={profile.name ? 'Edit name' : 'Set name'}
                      onClick={() => {
                        setNameValue(profile.name ?? '')
                        setNameEditing(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            />
            <InfoRow
              icon={<AtSign className="h-4 w-4" />}
              label="Hatrick Username"
              value={usernameEditing ? (
                <form onSubmit={submitUsername} className="flex w-full max-w-sm items-center gap-2 sm:ml-auto">
                  <Input
                    value={usernameValue}
                    onChange={(event) => setUsernameValue(sanitize_username_input(event.target.value))}
                    minLength={3}
                    maxLength={20}
                    className="h-9 bg-input-background text-left"
                    autoFocus
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={usernameLoading || !is_valid_username(usernameValue)}>
                    {usernameLoading ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={usernameLoading}
                    onClick={() => {
                      setUsernameValue(profile.username)
                      setUsernameEditing(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <span>{profile.username}</span>
                  {canEditUsername ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="inline-flex h-6 w-6 items-center justify-center text-primary transition-colors "
                      aria-label="Edit username"
                      onClick={() => {
                        setUsernameValue(profile.username)
                        setUsernameEditing(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    canChangeUsername && (
                      <span className="text-xs text-muted-foreground/60">
                        Available {usernameNextChangeAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )
                  )}
                </div>
              )}
            />
            <InfoRow
              icon={<Eye className="h-4 w-4" />}
              label="Show Name Publicly"
              value={(
                <div className="flex items-center justify-start gap-2 sm:justify-end">
                  {visibilityLoading && <LoadingSpinner size="sm" />}
                  <div className="grid grid-cols-2 gap-2">
                    <VisibilityChoice
                      value="Yes"
                      selected={profile.show_name_publicly}
                      disabled={visibilityLoading}
                      onSelect={() => updateVisibility(true)}
                    />
                    <VisibilityChoice
                      value="No"
                      selected={!profile.show_name_publicly}
                      disabled={visibilityLoading}
                      onSelect={() => updateVisibility(false)}
                    />
                  </div>
                </div>
              )}
            />
            <InfoRow icon={<BadgeCheck className="h-4 w-4" />} label="Account Status" value={account_status_label(profile.account_status)} />
            <InfoRow icon={<KeyRound className="h-4 w-4" />} label="Auth Provider" value={provider_label(profile.provider)} />
            <InfoRow
              icon={<Globe2 className="h-4 w-4" />}
              label="Timezone"
              value={(
                <div className="flex items-center justify-start gap-2 sm:justify-end">
                  {timezoneLoading && <LoadingSpinner size="sm" />}
                  <Select value={profile.timezone} onValueChange={updateTimezone} disabled={timezoneLoading}>
                    <SelectTrigger className="h-9 w-full shadow-none sm:w-56">
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>{timezone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Joined Date" value={format_date(profile.created_at)} />
          </div>
        </div>
      </div>
    </div>
  )
}
