import { queryOptions, useQuery } from '@tanstack/react-query'

import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { CameraRoi } from '@/features/cameras/types'
import { fetchList } from '@/lib/api-request'
import { cameraRoiFixtures } from '@/testing/fixtures/cameras'

const getCameraRois = (cameraId?: number) =>
  fetchList<CameraRoi>(
    '/cameras/get_rois',
    cameraId === undefined
      ? cameraRoiFixtures
      : cameraRoiFixtures.filter((roi) => roi.cameraId === cameraId),
    cameraId === undefined ? undefined : { cameraId },
  )

export const cameraRoisQueryOptions = (cameraId?: number) =>
  queryOptions({
    queryKey: cameraKeys.rois(cameraId),
    queryFn: () => getCameraRois(cameraId),
  })

export const useCameraRois = (cameraId?: number) =>
  useQuery(cameraRoisQueryOptions(cameraId))
