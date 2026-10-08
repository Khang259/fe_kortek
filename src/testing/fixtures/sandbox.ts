import type { SandboxNode, SandboxOrder } from '@/features/sandbox/types'

/** Seed tối giản: SBA/SBB × vài start + 1 end — mock smoke. */
export const sandboxNodeFixtures: SandboxNode[] = [
  {
    nodeId: 'start_9000001',
    cameraId: 1,
    cameraEnabled: true,
    detected: false,
  },
  {
    nodeId: 'start_9000002',
    cameraId: 1,
    cameraEnabled: true,
    detected: false,
  },
  {
    nodeId: 'start_9000011',
    cameraId: 2,
    cameraEnabled: true,
    detected: false,
  },
  {
    nodeId: 'start_9000012',
    cameraId: 2,
    cameraEnabled: true,
    detected: false,
  },
  {
    nodeId: 'end_9000101',
    cameraId: 3,
    cameraEnabled: true,
    detected: false,
  },
]

export const sandboxOrderFixtures: SandboxOrder[] = [
  {
    seq: 1,
    orderId: 'S-9000001-9000101-2026-10-06 17:00:00.123456',
    taskPath: ['9000001,9000101'],
    status: 9,
    sentAt: 1791280800.12,
  },
]
