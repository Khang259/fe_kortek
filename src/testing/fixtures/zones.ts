import type { WarehouseZone } from '@/features/zones/types'

export const zoneFixtures: WarehouseZone[] = [
  {
    id: 'AE5',
    name: 'Khu AE5',
    isRunning: true,
    isStreaming: true,
    isConfigEnabled: true,
    nodeCount: 5,
    cameraCount: 3,
    lastChangedAt: null,
    lastChangedBy: null,
  },
  {
    id: 'BF2',
    name: 'Khu BF2',
    isRunning: true,
    isStreaming: true,
    isConfigEnabled: true,
    nodeCount: 4,
    cameraCount: 2,
    lastChangedAt: null,
    lastChangedBy: null,
  },
]
