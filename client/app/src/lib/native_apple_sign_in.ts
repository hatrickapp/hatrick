import { registerPlugin } from '@capacitor/core'

export interface NativeAppleSignInOptions {
  nonce?: string
}

export interface NativeAppleSignInResult {
  identityToken: string
  authorizationCode?: string | null
  userIdentifier?: string | null
  email?: string | null
  fullName?: string | null
}

export interface NativeAppleSignInPlugin {
  signIn(options?: NativeAppleSignInOptions): Promise<NativeAppleSignInResult>
}

export const NativeAppleSignIn = registerPlugin<NativeAppleSignInPlugin>('HatrickAppleSignIn')
