import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { zoneKeys } from '@/features/zones/api/get-zones'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import type { WarehouseZone } from '@/features/zones/types'
import { apiClient } from '@/lib/axios'
import { useSessionStore } from '@/stores/session-store'
import { mockRequest } from '@/testing/mock-request'
import { zoneFixtures } from '@/testing/fixtures/zones'

interface ToggleZoneInput {
  /** null = start_all / stop_all (cần quyền system.control). */
  zoneId: string | null
  isRunning: boolean
}

interface ToggleZoneResult {
  message?: string
  enabled?: number
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
    return mockRequest(
      {
        message: zoneId
          ? `Zone ${zoneId} ${isRunning ? 'enabled' : 'disabled'}`
          : isRunning
            ? 'Cameras started'
            : 'All cameras disabled',
        enabled: zoneFixtures.filter((z) => z.isRunning).length,
      },
      200,
    )
  }

  if (zoneId === null) {
    const path = isRunning ? '/system/start_all' : '/system/stop_all'
    const { data } = await apiClient.post<ToggleZoneResult>(path)
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
    onSuccess: (_data, variables) => {
      // Optimistic armed — sau invalidate sẽ sync lại từ get_zones.
      if (variables.zoneId === null) {
        useSystemPowerStore.getState().setFleetActive(variables.isRunning)
      }
    },
    onSettled: async (_data, _error, variables) => {
      if (variables.zoneId === null) {
        useSystemPowerStore.getState().setFleetMutationPending(false)
      }

      // Luôn refetch — start_all 503 vẫn có thể đã bật enabled (isRunning true).
      await queryClient.invalidateQueries({ queryKey: zoneKeys.list() })

      if (variables.zoneId === null) {
        syncFleetArmedFromZones(queryClient)
      }
    },
  })
}
