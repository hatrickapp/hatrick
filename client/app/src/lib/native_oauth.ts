import { Capacitor } from '@capacitor/core'
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in'
import { NativeAppleSignIn } from '@/lib/native_apple_sign_in'

let google_ready: Promise<void> | null = null

function require_native_platform(provider: string) {
  if (!Capacitor.isNativePlatform()) {
    throw new Error(`${provider} sign-in is only available in the mobile app.`)
  }
}

function google_client_id(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (typeof clientId !== 'string' || clientId.length === 0) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID.')
  }
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Invalid Google client ID.')
  }
  return clientId
}

function random_nonce(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function prepare_google_sign_in(): Promise<void> {
  if (!google_ready) {
    google_ready = GoogleSignIn.initialize({
      clientId: google_client_id(),
    })
  }
  return google_ready
}

export async function native_google_id_token(): Promise<string> {
  require_native_platform('Google')
  await prepare_google_sign_in()
  const result = await GoogleSignIn.signIn()
  if (!result.idToken) {
    throw new Error('Google did not return an identity token.')
  }
  return result.idToken
}

export async function native_apple_identity() {
  require_native_platform('Apple')
  if (Capacitor.getPlatform() !== 'ios') {
    throw new Error('Sign in with Apple is only native on iOS.')
  }

  const nonce = random_nonce()
  const result = await NativeAppleSignIn.signIn({ nonce })
  if (!result.identityToken) {
    throw new Error('Apple did not return an identity token.')
  }

  return {
    identity_token: result.identityToken,
    authorization_code: result.authorizationCode ?? null,
    nonce,
    user_identifier: result.userIdentifier ?? null,
    email: result.email ?? null,
    full_name: result.fullName ?? null,
  }
}
