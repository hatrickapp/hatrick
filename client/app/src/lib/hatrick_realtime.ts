import { refresh_hatrick_caches_silently } from '@/controllers/cache_orchestrator'
import { load_profile } from '@/controllers/dashboard_controller'
import { refresh_users_caches_silently } from '@/controllers/users_controller'
import { BASE_URL } from '@/lib/constants'
import { get_session_token, is_mobile_client } from '@/lib/auth_tokens'

let socket: WebSocket | null = null
let reconnectTimer: number | null = null
let reconnectAttempts = 0
let openingSocket = false

async function websocket_url(): Promise<string> {
  const url = new URL(`${BASE_URL.replace(/^http/, 'ws')}/v1/realtime/refresh`)
  if (is_mobile_client()) {
    const session_token = await get_session_token()
    if (session_token) {
      url.searchParams.set('client_type', 'mobile')
      url.searchParams.set('session_token', session_token)
    }
  }
  return url.toString()
}

function schedule_reconnect() {
  if (reconnectTimer !== null) return
  const delay = Math.min(30_000, 1000 * 2 ** reconnectAttempts)
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    reconnectAttempts += 1
    void start_hatrick_realtime()
  }, delay)
}

export async function start_hatrick_realtime() {
  if (openingSocket || (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))) return

  openingSocket = true
  let url: string
  try {
    url = await websocket_url()
  } finally {
    openingSocket = false
  }

  socket = new WebSocket(url)
  socket.onopen = () => {
    reconnectAttempts = 0
  }
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as { type?: string; scope?: string }
      if (payload.type === 'refresh' && payload.scope === 'dashboard') {
        void Promise.allSettled([
          refresh_hatrick_caches_silently(),
          refresh_users_caches_silently(),
        ])
      } else if (payload.type === 'refresh' && payload.scope === 'profile') {
        void load_profile()
      }
    } catch (error) {
      void error
    }
  }
  socket.onclose = () => {
    socket = null
    schedule_reconnect()
  }
  socket.onerror = () => {
    socket?.close()
  }
}

export function stop_hatrick_realtime() {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  socket?.close()
  socket = null
}
