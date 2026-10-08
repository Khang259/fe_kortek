import { queryOptions, useQuery } from '@tanstack/react-query'

import type { WarehouseZone } from '@/features/zones/types'
import { fetchList } from '@/lib/api-request'
import { zoneFixtures } from '@/testing/fixtures/zones'

export const zoneKeys = {
  all: ['zones'] as const,
  list: () => [...zoneKeys.all, 'list'] as const,
}

const getZones = () => fetchList<WarehouseZone>('/zones/get_zones', zoneFixtures)

export const zonesQueryOptions = queryOptions({
  queryKey: zoneKeys.list(),
  queryFn: getZones,
})

export const useZones = () => useQuery(zonesQueryOptions)

/**
 * ≥1 zone `isRunning` — công tắc enabled (armed).
 * Nút start_all/stop_all dùng `fleetActive` (hydrate từ field này).
 */
export const useIsAnyZoneRunning = () =>
  useQuery({
    ...zonesQueryOptions,
    select: (zones) => zones.some((zone) => zone.isRunning),
  })

/**
 * ≥1 zone `isStreaming` — fleet live (có frame).
 * Badge topbar “Đang vận hành” dùng hook này.
 */
export const useIsAnyZoneStreaming = () =>
  useQuery({
    ...zonesQueryOptions,
    select: (zones) => zones.some((zone) => zone.isStreaming),
  })
