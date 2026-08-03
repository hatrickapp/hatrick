import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppMark } from '@/components/shared/app_mark'
import { ErrorAlert } from '@/components/shared/error_alert'
import { LoadingSpinner } from '@/components/shared/loading_spinner'
import { PageLoader } from '@/components/shared/page_loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { handle_update_profile_username, load_profile } from '@/controllers/dashboard_controller'
import { ROUTES } from '@/lib/constants'
import { is_valid_username, sanitize_username_input } from '@/lib/username_validation'
import { use_dashboard_store } from '@/store/dashboard_store'

export function UsernameSetupPage() {
  const navigate = useNavigate()
  const profile = use_dashboard_store((s) => s.profile)
  const [loading, setLoading] = useState(!profile)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load_profile().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (profile) setUsername(profile.username)
  }, [profile])

  if (loading) return <PageLoader />
  if (!profile) return <Navigate to={ROUTES.LOGIN} replace />
  if (profile.username_setup_completed) return <Navigate to={ROUTES.DASHBOARD_MATCHES} replace />

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!is_valid_username(username)) {
      setError('Use 3 to 20 lowercase letters, numbers, or underscores with no offensive words.')
      return
    }
    setSaving(true)
    try {
      await handle_update_profile_username(username)
      navigate(ROUTES.DASHBOARD_MATCHES, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your username.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 -mt-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-0">
          <AppMark className="h-32" markClassName="h-24 w-24" textClassName="sr-only" />
        </div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Create your <span className="text-primary">Hatrick</span> username
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Make it unique and keep it clean. Usernames with offensive words can lead to account restrictions.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Input
          value={username}
          onChange={(event) => setUsername(sanitize_username_input(event.target.value))}
          minLength={3}
          maxLength={20}
          autoFocus
          className="h-11 bg-input-background text-left"
          aria-label="Hatrick username"
        />
        <Button type="submit" className="h-10 w-full font-medium" disabled={saving || !is_valid_username(username)}>
          {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Username
        </Button>
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      </form>
    </div>
  )
}
