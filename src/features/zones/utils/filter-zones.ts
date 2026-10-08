import { FILTER_ALL } from '@/config/constants'
import type { WarehouseZone } from '@/features/zones/types'

export function filterZones(
  zones: WarehouseZone[],
  status: string,
): WarehouseZone[] {
  if (status === FILTER_ALL) {
    return zones
  }
  if (status === 'running') {
    return zones.filter((zone) => zone.isStreaming)
  }
  if (status === 'stopped') {
    return zones.filter((zone) => !zone.isRunning)
  }
  return zones
}
