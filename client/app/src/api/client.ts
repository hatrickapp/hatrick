import { BASE_URL } from '@/lib/constants'
import { clear_session_token, get_auth_tokens, is_mobile_client, persist_auth_tokens_from_response } from '@/lib/auth_tokens'
import { use_auth_store } from '@/store/auth_store'
import { use_dashboard_store } from '@/store/dashboard_store'
import type { ApiError } from '@/types/base_types'
import { CapacitorHttp } from '@capacitor/core'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown> | FormData
  idempotency_key?: string
  signal?: AbortSignal
}

export class ApiRequestError extends Error {
  code: string

  constructor(error: ApiError) {
    super(error.message)
    this.code = error.code
    this.name = 'ApiRequestError'
  }
}

let session_expired_handled = false

function handle_session_expired(): never {
  void clear_session_token()

  if (!session_expired_handled && use_auth_store.getState().is_authenticated) {
    session_expired_handled = true

    use_auth_store.getState().clear()
    const ds = use_dashboard_store.getState()
    ds.clear_dashboard()

    window.dispatchEvent(new Event('session-expired'))
  }

  throw new ApiRequestError({ code: 'SESSION_EXPIRED', message: 'Your session has expired.' })
}

export async function api_request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotency_key, signal } = options
  const mobile_client = is_mobile_client()
  const tokens = await get_auth_tokens()

  const headers: Record<string, string> = {
    'X-Client-Type': mobile_client ? 'mobile' : 'web',
  }

  if (tokens.session_token) {
    headers.Authorization = `Bearer ${tokens.session_token}`
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (idempotency_key) {
    headers['X-Idempotency-Key'] = idempotency_key
  }

  if (mobile_client) {
    try {
      const capResponse = await CapacitorHttp.request({
        url: `${BASE_URL}${path}`,
        method,
        headers,
        data: body,
      })

      const ok = capResponse.status >= 200 && capResponse.status < 300

      if (capResponse.status === 401) {
        handle_session_expired()
      }

      const data = capResponse.data

      if (!ok) {
        if (data?.error?.code) {
          throw new ApiRequestError(data.error)
        }
        if (data?.detail) {
          throw new ApiRequestError({ code: data.detail, message: data.detail })
        }
        throw new ApiRequestError({ code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' })
      }

      session_expired_handled = false
      await persist_auth_tokens_from_response(data)
      return data as T
    } catch (err) {
      if (err instanceof ApiRequestError) {
        throw err
      }
      throw new ApiRequestError({
        code: 'NETWORK_ERROR',
        message: `Could not reach the API at ${BASE_URL}. Make sure the backend is running on this network.`,
      })
    }
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      signal,
    })
  } catch {
    throw new ApiRequestError({
      code: 'NETWORK_ERROR',
      message: `Could not reach the API at ${BASE_URL}. Make sure the backend is running on this network.`,
    })
  }

  if (response.status === 401) {
    handle_session_expired()
  }

  const data = await response.json()

  if (!response.ok) {
    if (data?.error?.code) {
      throw new ApiRequestError(data.error)
    }
    if (data?.detail) {
      throw new ApiRequestError({ code: data.detail, message: data.detail })
    }
    throw new ApiRequestError({ code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' })
  }

  session_expired_handled = false
  await persist_auth_tokens_from_response(data)
  return data as T
}
