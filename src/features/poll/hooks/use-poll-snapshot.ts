import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { Camera } from '@/features/cameras/types'
import { mapKeys } from '@/features/maps/api/map-keys'
import { normalizeNodeRuntimeSnapshot } from '@/features/nodes/api/get-runtime-state'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import { notificationKeys } from '@/features/notifications/api/get-notifications'
import { fetchPollSnapshot } from '@/features/poll/api/get-poll-snapshot'
import type { PollSnapshot } from '@/features/poll/types'
import { zoneKeys } from '@/features/zones/api/get-zones'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import type { WarehouseZone } from '@/features/zones/types'

const DEFAULT_POLL_MS = 2_000

/**
 * Poll snapshot toàn app — thay WebSocket.
 * Patch cache cameras/zones/unread; invalidate map khi activeVersionId đổi.
 */
export function usePollSnapshot() {
  const queryClient = useQueryClient()
  const etagRef = useRef<string | null>(null)
  const intervalSecRef = useRef(DEFAULT_POLL_MS / 1000)
  const activeMapRef = useRef<string | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  const applySnapshot = useCallback(
    (snapshot: PollSnapshot) => {
      etagRef.current = snapshot.etag
      if (snapshot.pollIntervalSec > 0) {
        intervalSecRef.current = snapshot.pollIntervalSec
      }

      if (snapshot.cameras?.items) {
        queryClient.setQueryData<Camera[]>(cameraKeys.list(), (cameras) => {
          if (!cameras) {
            return cameras
          }
          const byId = new Map(
            snapshot.cameras!.items.map((item) => [item.cameraId, item]),
          )
          return cameras.map((camera) => {
            const patch = byId.get(camera.cameraId)
            if (!patch) {
              return camera
            }
            return {
              ...camera,
              status: patch.status,
              enabled: patch.enabled,
              zone: patch.zone,
              error: patch.error,
            }
          })
        })
      }

      if (snapshot.zones?.items) {
        const freezeRuntime =
          useSystemPowerStore.getState().fleetMutationPending
        queryClient.setQueryData<WarehouseZone[]>(zoneKeys.list(), (zones) => {
          if (!zones) {
            return zones
          }
          const byId = new Map(
            snapshot.zones!.items.map((item) => [item.id, item]),
          )
          return zones.map((zone) => {
            const patch = byId.get(zone.id)
            if (!patch) {
              return zone
            }
            return {
              ...zone,
              // start_all/stop_all pending: giữ runtime flags — tránh badge nhảy sớm.
              isRunning: freezeRuntime ? zone.isRunning : patch.isRunning,
              isStreaming: freezeRuntime ? zone.isStreaming : patch.isStreaming,
              isConfigEnabled: patch.isConfigEnabled,
              cameraCount: patch.cameraCount,
              nodeCount: patch.nodeCount,
            }
          })
        })
      }

      if (snapshot.notifications) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          snapshot.notifications.unreadCount,
        )
      }

      const nextMapId = snapshot.map?.activeVersionId ?? null
      if (
        nextMapId !== null &&
        activeMapRef.current !== null &&
        nextMapId !== activeMapRef.current
      ) {
        queryClient.invalidateQueries({ queryKey: mapKeys.all })
      }
      if (nextMapId !== null) {
        activeMapRef.current = nextMapId
      }

      /**
       * Fallback khi SSE fail / mock / chưa ready: khối `nodes` từ poll.
       * Khi SSE ổn — không replace để tránh đè delta mới hơn.
       */
      if (snapshot.nodes) {
        const { sseFailed, runtimeReady } = useNodeRuntimeStore.getState()
        if (sseFailed || !runtimeReady || env.useMockApi) {
          useNodeRuntimeStore
            .getState()
            .replaceAll(normalizeNodeRuntimeSnapshot(snapshot.nodes))
        }
      }
    },
    [queryClient],
  )

  const tick = useCallback(async () => {
    try {
      const snapshot = await fetchPollSnapshot(etagRef.current)
      if (snapshot) {
        applySnapshot(snapshot)
      }
    } catch {
      /* Poll lỗi: giữ chu kỳ, lần sau thử lại — không mở WS. */
    }
  }, [applySnapshot])

  useEffect(() => {
    let cancelled = false

    const loop = async () => {
      await tick()
      if (cancelled) {
        return
      }
      const delay = Math.max(1, intervalSecRef.current) * 1000
      timerRef.current = window.setTimeout(loop, delay)
    }

    const onFocus = () => {
      void tick()
    }

    void loop()
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      window.clearTimeout(timerRef.current)
      window.removeEventListener('focus', onFocus)
    }
  }, [tick])
}
