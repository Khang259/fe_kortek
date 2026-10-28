import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import {
  mockPauseScan,
  mockStartScan,
} from '@/features/system/api/runtime-mock'
import { runtimeKeys } from '@/features/system/api/runtime-keys'
import type { StartCamerasResult } from '@/features/system/types'
import { zoneKeys } from '@/features/zones/api/get-zones'
import { useInferenceStore } from '@/features/zones/stores/inference-store'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import type { WarehouseZone } from '@/features/zones/types'
import { apiClient } from '@/lib/axios'
import { useSessionStore } from '@/stores/session-store'
import { mockRequest } from '@/testing/mock-request'
import { cameraFixtures } from '@/testing/fixtures/cameras'
import { zoneFixtures } from '@/testing/fixtures/zones'

interface ToggleZoneInput {
  /** null = start-cameras / stop_all (cần quyền system.control). */
  zoneId: string | null
  isRunning: boolean
}

interface ToggleZoneResult {
  message?: string
  total?: number
  enabled?: number
  streaming?: number
  scanning?: boolean
  warnings?: string[]
}

async function toggleZone({
  zoneId,
  isRunning,
}: ToggleZoneInput): Promise<ToggleZoneResult | undefined> {
  if (env.useMockApi) {
    const actor = useSessionStore.getState().user?.name ?? 'unknown'

    zoneFixtures.forEach((zone) => {
      if (zoneId === null || zone.id === zoneId) {
        zone.isRunning = isRunning
        // Mock: giả sử RTSP OK ngay khi bật công tắc.
        zone.isStreaming = isRunning
        zone.lastChangedAt = new Date().toISOString()
        zone.lastChangedBy = actor
      }
    })

    // start-cameras = camera + inference; stop_all = tắt inference mock.
    if (zoneId === null) {
      if (isRunning) {
        cameraFixtures.forEach((camera) => {
          camera.enabled = true
        })
        mockStartScan()
      } else {
        cameraFixtures.forEach((camera) => {
          camera.enabled = false
        })
        mockPauseScan()
      }
    }

    return mockRequest(
      {
        message: zoneId
          ? `Zone ${zoneId} ${isRunning ? 'enabled' : 'disabled'}`
          : isRunning
            ? 'Cameras started and scanning'
            : 'All cameras disabled',
        enabled: zoneFixtures.filter((z) => z.isRunning).length,
        total: zoneFixtures.length,
        streaming: zoneFixtures.filter((z) => z.isStreaming).length,
        scanning: isRunning && zoneId === null,
        warnings: [],
      },
      200,
    )
  }

  if (zoneId === null) {
    if (isRunning) {
      // Contract: camera ON + inference ON — thay start_all (deprecated).
      const { data } = await apiClient.post<StartCamerasResult>(
        '/system/start-cameras',
      )
      return {
        message: data.message,
        total: data.total,
        enabled: data.enabled,
        streaming: data.streaming,
        scanning: data.scanning ?? true,
        warnings: data.warnings,
      }
    }
    const { data } = await apiClient.post<ToggleZoneResult>('/system/stop_all')
    return data
  }

  const path = isRunning ? '/zones/start_zone' : '/zones/stop_zone'
  const { data } = await apiClient.post<ToggleZoneResult>(path, {
    zoneId,
  })
  return data
}

function syncFleetArmedFromZones(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const zones = queryClient.getQueryData<WarehouseZone[]>(zoneKeys.list())
  if (!zones) {
    return
  }
  useSystemPowerStore
    .getState()
    .setFleetActive(zones.some((zone) => zone.isRunning))
}

export function useToggleZone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleZone,
    onMutate: async (variables) => {
      if (variables.zoneId !== null) {
        return
      }

      useSystemPowerStore.getState().setFleetMutationPending(true)
      await queryClient.cancelQueries({ queryKey: zoneKeys.list() })
    },
    onSuccess: (data, variables) => {
      // Optimistic armed — sau invalidate sẽ sync lại từ get_zones.
      if (variables.zoneId === null) {
        useSystemPowerStore.getState().setFleetActive(variables.isRunning)
        // start-cameras bật luôn inference (scanning).
        if (variables.isRunning && data?.scanning !== false) {
          useInferenceStore.getState().setReady(true)
          void queryClient.invalidateQueries({
            queryKey: runtimeKeys.status(),
          })
          void queryClient.invalidateQueries({
            queryKey: runtimeKeys.pendingPairs(),
          })
        }
        if (!variables.isRunning) {
          useInferenceStore.getState().setReady(false)
        }
      }
    },
    onSettled: async (_data, _error, variables) => {
      if (variables.zoneId === null) {
        useSystemPowerStore.getState().setFleetMutationPending(false)
      }

      // Luôn refetch — start 503 vẫn có thể đã bật enabled (isRunning true).
      await queryClient.invalidateQueries({ queryKey: zoneKeys.list() })

      if (variables.zoneId === null) {
        syncFleetArmedFromZones(queryClient)
      }
    },
  })
}
