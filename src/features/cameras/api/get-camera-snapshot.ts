import { queryOptions, useQuery } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'

/**
 * Snapshot JPEG hiện tại của camera.
 * Mock: SVG tĩnh. API thật: binary image/jpeg từ get_snapshot.
 */
async function getCameraSnapshot(cameraId: number): Promise<string> {
  if (env.useMockApi) {
    return mockRequest(`/camera-snapshots/cam-${cameraId}.svg`, 200)
  }

  const response = await apiClient.get<Blob>('/cameras/get_snapshot', {
    params: { cameraId },
    responseType: 'blob',
  })

  return URL.createObjectURL(response.data)
}

export const cameraSnapshotQueryOptions = (cameraId: number) =>
  queryOptions({
    queryKey: [...cameraKeys.all, 'snapshot', cameraId] as const,
    queryFn: () => getCameraSnapshot(cameraId),
    staleTime: 30_000,
    /**
     * Blob URL phải thu hồi khi query bị GC, nếu không rò bộ nhớ.
     * gcTime đủ ngắn để unmount dialog sớm thu hồi.
     */
    gcTime: 60_000,
  })

export const useCameraSnapshot = (cameraId: number, enabled = true) =>
  useQuery({
    ...cameraSnapshotQueryOptions(cameraId),
    enabled,
  })
