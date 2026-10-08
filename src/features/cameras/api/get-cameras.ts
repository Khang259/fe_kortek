import { queryOptions, useQuery } from '@tanstack/react-query'

import type { Camera } from '@/features/cameras/types'
import { countCamerasByStatus } from '@/features/cameras/utils/camera-status'
import { fetchList } from '@/lib/api-request'
import { cameraFixtures } from '@/testing/fixtures/cameras'

export const cameraKeys = {
  all: ['cameras'] as const,
  list: () => [...cameraKeys.all, 'list'] as const,
  rois: (cameraId?: number) =>
    [...cameraKeys.all, 'rois', cameraId ?? 'all'] as const,
}

/** API trả cameraId; FE giữ thêm `id` để tương thích UI cũ. */
function normalizeCamera(item: Camera): Camera {
  const cameraId = item.cameraId ?? item.id
  return {
    ...item,
    cameraId,
    id: cameraId,
    format: item.format?.trim() || 'H264',
    mapPosition: item.mapPosition ?? null,
    error: item.error ?? null,
  }
}

const getCameras = async () => {
  const items = await fetchList<Camera>('/cameras/get_cameras', cameraFixtures)
  return items.map(normalizeCamera)
}

export const camerasQueryOptions = queryOptions({
  queryKey: cameraKeys.list(),
  queryFn: getCameras,
})

export const useCameras = () => useQuery(camerasQueryOptions)

export const useMappedCameras = () =>
  useQuery({
    ...camerasQueryOptions,
    select: (cameras) =>
      cameras.filter((camera) => camera.mapPosition !== null),
  })

export const useCameraStatusCounts = () =>
  useQuery({ ...camerasQueryOptions, select: countCamerasByStatus })
