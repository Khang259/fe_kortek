import type { AuthUser } from '@/types'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
  /** Thời hạn access token tính bằng giây. */
  expiresIn: number
  user: AuthUser
}

export type LoginResponse = AuthTokensResponse
