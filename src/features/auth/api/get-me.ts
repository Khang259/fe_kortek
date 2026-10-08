import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { useSessionStore } from '@/stores/session-store'
import type { AuthUser } from '@/types'
import { mockRequest } from '@/testing/mock-request'

async function getMe(): Promise<AuthUser> {
  if (env.useMockApi) {
    const user = useSessionStore.getState().user
    if (!user) {
      throw { status: 401, message: 'Not signed in' }
    }
    return mockRequest(user, 150)
  }

  const { data } = await apiClient.get<AuthUser>('/auth/get_me')
  return data
}

/**
 * Khôi phục / làm mới `user` + `permissions` khi F5.
 * Chỉ chạy khi đã có accessToken.
 */
export function useAuthMe(enabled: boolean) {
  const setUser = useSessionStore((state) => state.setUser)
  const clearSession = useSessionStore((state) => state.clearSession)

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled,
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  useEffect(() => {
    if (query.isError && !env.useMockApi) {
      clearSession()
    }
  }, [query.isError, clearSession])

  return query
}
