export interface ApiError {
  code: string
  message: string
}

export interface BaseResponse {
  success: boolean
  error?: ApiError
}
