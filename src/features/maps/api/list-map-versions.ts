import { queryOptions, useQuery } from '@tanstack/react-query'

import { mapKeys } from '@/features/maps/api/map-keys'
import type { ListMapVersionsResponse } from '@/features/maps/types'
import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { listMapVersionsFixture } from '@/testing/fixtures/maps'

async function listMapVersions(): Promise<ListMapVersionsResponse> {
  if (env.useMockApi) {
    return mockRequest(listMapVersionsFixture())
  }

  const { data } = await apiClient.get<ListMapVersionsResponse>(
    '/maps/list_map_versions',
  )
  return data
}

export const mapVersionsQueryOptions = queryOptions({
  queryKey: mapKeys.versions(),
  queryFn: listMapVersions,
})

export function useMapVersions(enabled = true) {
  return useQuery({
    ...mapVersionsQueryOptions,
    enabled,
  })
}
