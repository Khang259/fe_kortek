import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchPreviewMeta, webrtcKeys } from '@/features/cameras/api/webrtc'
import { env } from '@/config/env'

/** Overlay detect — poll meta ~200ms khi session live. */
export const previewMetaQueryOptions = (cameraId: number, enabled: boolean) =>
  queryOptions({
    queryKey: webrtcKeys.meta(cameraId),
    queryFn: () => fetchPreviewMeta(cameraId),
    enabled: enabled && !env.useMockApi,
    refetchInterval: enabled ? 200 : false,
    staleTime: 0,
    retry: false,
  })

export function usePreviewMeta(cameraId: number, enabled: boolean) {
  return useQuery(previewMetaQueryOptions(cameraId, enabled))
}
