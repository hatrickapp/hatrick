import { api_request } from './client'
import type { AuthenticatedUserResponse, MobileAuthResponse, NativeAppleOAuthRequest, NativeGoogleOAuthRequest, ProfileVisibilityResponse, ProfileNameResponse, ProfileUsernameResponse, UpdateProfileNameRequest, UpdateProfileTimezoneRequest, UpdateProfileUsernameRequest, UpdateProfileVisibilityRequest, UserIdResponse, UserProfileResponse, UserSessionsResponse, ProfileTimezoneResponse } from '@/types/authentication_types'
import type { BaseResponse } from '@/types/base_types'

const AUTH = '/v1/auth'

export async function get_me(): Promise<AuthenticatedUserResponse> {
  return api_request<AuthenticatedUserResponse>(`${AUTH}/user/me`)
}

export async function get_profile(): Promise<UserProfileResponse> {
  return api_request<UserProfileResponse>(`${AUTH}/user/profile`)
}

export async function update_profile_name(
  body: UpdateProfileNameRequest,
  idempotency_key: string,
): Promise<ProfileNameResponse> {
  return api_request<ProfileNameResponse>(`${AUTH}/user/profile/name`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function update_profile_username(
  body: UpdateProfileUsernameRequest,
  idempotency_key: string,
): Promise<ProfileUsernameResponse> {
  return api_request<ProfileUsernameResponse>(`${AUTH}/user/profile/username`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function update_profile_visibility(
  body: UpdateProfileVisibilityRequest,
  idempotency_key: string,
): Promise<ProfileVisibilityResponse> {
  return api_request<ProfileVisibilityResponse>(`${AUTH}/user/profile/visibility`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function update_profile_timezone(
  body: UpdateProfileTimezoneRequest,
  idempotency_key: string,
): Promise<ProfileTimezoneResponse> {
  return api_request<ProfileTimezoneResponse>(`${AUTH}/user/profile/timezone`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function get_sessions(): Promise<UserSessionsResponse> {
  return api_request<UserSessionsResponse>(`${AUTH}/user/sessions`)
}

export async function logout(idempotency_key: string): Promise<BaseResponse> {
  return api_request<BaseResponse>(`${AUTH}/logout`, {
    method: 'POST',
    body: {},
    idempotency_key,
  })
}

export async function account_delete_initiate(idempotency_key: string): Promise<UserIdResponse> {
  return api_request<UserIdResponse>(`${AUTH}/account/delete/initiate`, {
    method: 'POST',
    body: {},
    idempotency_key,
  })
}

export async function account_delete_complete(
  body: { otp: string },
  idempotency_key: string,
): Promise<BaseResponse> {
  return api_request<BaseResponse>(`${AUTH}/account/delete/complete`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    idempotency_key,
  })
}

export async function oauth_google_native(
  body: NativeGoogleOAuthRequest,
): Promise<MobileAuthResponse> {
  return api_request<MobileAuthResponse>(`${AUTH}/oauth/google/native`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
  })
}

export async function oauth_apple_native(
  body: NativeAppleOAuthRequest,
): Promise<MobileAuthResponse> {
  return api_request<MobileAuthResponse>(`${AUTH}/oauth/apple/native`, {
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
  })
}
