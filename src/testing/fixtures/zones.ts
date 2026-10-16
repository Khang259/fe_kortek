import type { WarehouseZone } from '@/features/zones/types'

/** Seed zones X/Y — nodes topo thuộc zone X; Y dự phòng trống. */
export const zoneFixtures: WarehouseZone[] = [
  {
    id: 'X',
    name: 'Zone X',
    isRunning: true,
    isStreaming: true,
    isConfigEnabled: true,
    nodeCount: 38,
    cameraCount: 7,
    lastChangedAt: null,
    lastChangedBy: null,
  },
  {
    id: 'Y',
    name: 'Zone Y',
    isRunning: false,
    isStreaming: false,
    isConfigEnabled: true,
    nodeCount: 0,
    cameraCount: 0,
    lastChangedAt: null,
    lastChangedBy: null,
  },
]
