import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import { apiClient } from '@/lib/axios'
import { useSessionStore } from '@/stores/session-store'
import { mockRequest } from '@/testing/mock-request'

async function logout() {
  if (env.useMockApi) {
    return mockRequest(undefined, 150)
  }

  await apiClient.post('/auth/logout')
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearSession = useSessionStore((state) => state.clearSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    meta: { skipToast: true },
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate(ROUTES.login, { replace: true })
    },
  })
}
