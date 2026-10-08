import type { PollSnapshot } from '@/features/poll/types'
import { cameraFixtures } from '@/testing/fixtures/cameras'
import { zoneFixtures } from '@/testing/fixtures/zones'
import { notificationFixtures } from '@/testing/fixtures/notifications'
import { isNotificationUnread } from '@/features/notifications/types'
import { ACTIVE_MAP_VERSION_ID } from '@/testing/fixtures/maps'
import { nodeRuntimeSnapshotFixture } from '@/testing/fixtures/node-runtime'

let etagCounter = 1

/** Mock snapshot — đổi etag mỗi lần để FE luôn nhận 200 khi mock. */
export function pollSnapshotFixture(): PollSnapshot {
  etagCounter += 1
  return {
    serverTime: new Date().toISOString(),
    pollIntervalSec: 2,
    etag: `mock-etag-${etagCounter}`,
    cameras: {
      items: cameraFixtures.map((camera) => ({
        cameraId: camera.cameraId,
        status: camera.status,
        enabled: camera.enabled,
        zone: camera.zone,
        error: camera.error,
      })),
    },
    zones: {
      items: zoneFixtures.map((zone) => ({
        id: zone.id,
        isRunning: zone.isRunning,
        isStreaming: zone.isStreaming,
        isConfigEnabled: zone.isConfigEnabled,
        cameraCount: zone.cameraCount,
        nodeCount: zone.nodeCount,
      })),
    },
    notifications: {
      unreadCount: notificationFixtures.filter(isNotificationUnread).length,
    },
    map: { activeVersionId: ACTIVE_MAP_VERSION_ID },
    nodes: nodeRuntimeSnapshotFixture(),
  }
}
