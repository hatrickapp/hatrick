import { Capacitor } from '@capacitor/core'
import { KeychainAccess, SecureStorage } from '@aparajita/capacitor-secure-storage'

const STORAGE_PREFIX = 'hatrick_auth_'
const SESSION_TOKEN_KEY = 'session_token'
const LEGACY_AUTH_KEYS = ['device' + '_token'] as const

export interface StoredAuthTokens {
  session_token: string | null
}

interface AuthTokenResponse {
  session_token?: unknown
}

let storage_ready: Promise<void> | null = null
let tokens_loaded: Promise<StoredAuthTokens> | null = null
let cached_tokens: StoredAuthTokens | null = null

export function is_mobile_client(): boolean {
  return Capacitor.isNativePlatform()
}

async function prepare_storage(): Promise<void> {
  if (!storage_ready) {
    storage_ready = Promise.all([
      SecureStorage.setKeyPrefix(STORAGE_PREFIX),
      SecureStorage.setSynchronize(false),
      SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlockedThisDeviceOnly),
    ])
      .then(async () => {
        await Promise.all(LEGACY_AUTH_KEYS.map((key) => SecureStorage.remove(key, false)))
      })
      .then(() => undefined)
  }
  return storage_ready
}

async function read_token(key: string): Promise<string | null> {
  const value = await SecureStorage.get(key, false, false)
  return typeof value === 'string' && value.length > 0 ? value : null
}

async function write_token(key: string, value: string): Promise<void> {
  await SecureStorage.set(key, value, false, false, KeychainAccess.whenUnlockedThisDeviceOnly)
}

export async function get_auth_tokens(): Promise<StoredAuthTokens> {
  if (!is_mobile_client()) {
    return { session_token: null }
  }

  if (cached_tokens) return cached_tokens
  if (!tokens_loaded) {
    tokens_loaded = (async () => {
      await prepare_storage()
      const tokens = {
        session_token: await read_token(SESSION_TOKEN_KEY),
      }
      cached_tokens = tokens
      return tokens
    })().catch((error) => {
      tokens_loaded = null
      throw error
    })
  }
  return tokens_loaded
}

export async function get_session_token(): Promise<string | null> {
  return (await get_auth_tokens()).session_token
}

export async function persist_auth_tokens_from_response(response: AuthTokenResponse): Promise<void> {
  if (!is_mobile_client()) return

  await prepare_storage()
  if (!cached_tokens) {
    cached_tokens = { session_token: null }
  }

  if (typeof response.session_token === 'string' && response.session_token.length > 0) {
    await write_token(SESSION_TOKEN_KEY, response.session_token)
    cached_tokens.session_token = response.session_token
  }
}

export async function clear_session_token(): Promise<void> {
  if (!is_mobile_client()) return

  await prepare_storage()
  await SecureStorage.remove(SESSION_TOKEN_KEY, false)
  cached_tokens = {
    session_token: null,
  }
  tokens_loaded = Promise.resolve(cached_tokens)
}

export async function clear_auth_tokens(): Promise<void> {
  if (!is_mobile_client()) return

  await prepare_storage()
  await SecureStorage.remove(SESSION_TOKEN_KEY, false)
  cached_tokens = { session_token: null }
  tokens_loaded = Promise.resolve(cached_tokens)
}
