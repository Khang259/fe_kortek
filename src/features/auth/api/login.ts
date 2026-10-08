import { useMutation } from '@tanstack/react-query'

import {
  ALL_PERMISSIONS,
  OPERATOR_PERMISSIONS,
} from '@/config/permissions'
import { env } from '@/config/env'
import type {
  LoginCredentials,
  LoginResponse,
} from '@/features/auth/types'
import { apiClient } from '@/lib/axios'
import { useSessionStore } from '@/stores/session-store'
import { mockRequest } from '@/testing/mock-request'

async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (env.useMockApi) {
    const isAdmin = credentials.username.toLowerCase() === 'admin'
    return mockRequest(
      {
        accessToken: `mock-access-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        expiresIn: 900,
        user: {
          id: isAdmin ? 'u-admin' : 'u-1',
          name: credentials.username,
          role: isAdmin ? 'admin' : 'operator',
          permissions: isAdmin ? ALL_PERMISSIONS : OPERATOR_PERMISSIONS,
        },
      },
      400,
    )
  }

  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login',
    credentials,
  )
  return data
}

export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: (data) =>
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        user: data.user,
      }),
  })
}
