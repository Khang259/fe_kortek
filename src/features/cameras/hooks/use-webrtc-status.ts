import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchWebRtcStatus, webrtcKeys } from '@/features/cameras/api/webrtc'
import { env } from '@/config/env'

/** Poll slot WebRTC ~2s khi đang mở màn live. */
export const webrtcStatusQueryOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: webrtcKeys.status(),
    queryFn: fetchWebRtcStatus,
    enabled: enabled && !env.useMockApi,
    refetchInterval: enabled ? 2_000 : false,
    staleTime: 1_000,
  })

export function useWebRtcStatus(enabled: boolean) {
  return useQuery(webrtcStatusQueryOptions(enabled))
}
