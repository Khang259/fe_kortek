import { queryOptions, useQuery } from '@tanstack/react-query'

import { mapKeys } from '@/features/maps/api/map-keys'
import type { GetCompressResponse } from '@/features/maps/types'
import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  ACTIVE_MAP_VERSION_ID,
  compressResponseFixture,
} from '@/testing/fixtures/maps'

async function getCompress(versionId?: string): Promise<GetCompressResponse> {
  if (env.useMockApi) {
    return mockRequest({
      ...compressResponseFixture,
      versionId: versionId ?? ACTIVE_MAP_VERSION_ID,
    })
  }

  const { data } = await apiClient.get<GetCompressResponse>(
    '/maps/get_compress',
    { params: versionId ? { versionId } : undefined },
  )
  return data
}

export const compressQueryOptions = (versionId?: string) =>
  queryOptions({
    queryKey: mapKeys.compress(versionId),
    queryFn: () => getCompress(versionId),
  })

export function useMapCompress(versionId?: string, enabled = true) {
  return useQuery({
    ...compressQueryOptions(versionId),
    enabled,
  })
}
