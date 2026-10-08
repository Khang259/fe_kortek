import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { mapKeys } from '@/features/maps/api/map-keys'
import type { SetActiveMapResult } from '@/features/maps/types'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { mapVersionFixtures } from '@/testing/fixtures/maps'
import type { ApiError } from '@/types'

async function setActiveMap(versionId: string): Promise<SetActiveMapResult> {
  if (env.useMockApi) {
    const target = mapVersionFixtures.find((item) => item.versionId === versionId)
    if (!target) {
      const error: ApiError = { status: 404, message: 'Version không tồn tại' }
      throw error
    }
    mapVersionFixtures.forEach((item) => {
      item.isActive = item.versionId === versionId
    })
    return mockRequest({ versionId, isActive: true }, 200)
  }

  const { data } = await apiClient.post<SetActiveMapResult>(
    '/maps/set_active_map',
    { versionId },
  )
  return data
}

export function useSetActiveMap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setActiveMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.all })
    },
  })
}
