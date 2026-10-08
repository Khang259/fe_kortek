import type { OrderSnapshots, SnapshotItem } from '@/features/snapshots/types'
import { activeTaskFixtures } from '@/testing/fixtures/active-tasks'
import { systemActionLogFixtures } from '@/testing/fixtures/logs'

const MOCK_FILES = ['pair-mock-a.jpg', 'pair-mock-b.jpg'] as const

function buildItems(
  orderId: string,
  startNodeId: string,
  endNodeId: string,
  file: string,
  createdAt: string,
): SnapshotItem[] {
  const imageUrl = `/api/v1/snapshots/get_image?file=${file}`
  return [
    {
      orderId,
      nodeId: startNodeId,
      nodeType: 'start',
      zoneId: 'A',
      imagePath: file,
      imageUrl,
      decision: 'auto',
      createdAt,
    },
    {
      orderId,
      nodeId: endNodeId,
      nodeType: 'end',
      zoneId: 'A',
      imagePath: file,
      imageUrl,
      decision: 'auto',
      createdAt,
    },
  ]
}

function buildFixture(
  orderId: string,
  startNodeId: string,
  endNodeId: string,
  index: number,
): OrderSnapshots {
  const file = MOCK_FILES[index % 2]!
  return {
    orderId,
    items: buildItems(
      orderId,
      startNodeId,
      endNodeId,
      file,
      `2026-10-08T05:0${index % 10}:01+00:00`,
    ),
  }
}

/**
 * Mock get_by_order — active tasks + system log dispatch success (review design).
 */
export const orderSnapshotFixtures: OrderSnapshots[] = (() => {
  const byOrder = new Map<string, OrderSnapshots>()

  activeTaskFixtures.forEach((task, index) => {
    /** Task cuối: empty state. */
    if (index === activeTaskFixtures.length - 1) {
      byOrder.set(task.orderId, { orderId: task.orderId, items: [] })
      return
    }
    byOrder.set(
      task.orderId,
      buildFixture(task.orderId, task.startNodeId, task.endNodeId, index),
    )
  })

  systemActionLogFixtures.forEach((log, index) => {
    if (
      log.action !== 'dispatch' ||
      log.result !== 'success' ||
      !log.orderId ||
      !log.orderId.startsWith('S-')
    ) {
      return
    }
    if (byOrder.has(log.orderId)) {
      return
    }
    byOrder.set(
      log.orderId,
      buildFixture(
        log.orderId,
        log.startNodeId ?? 'start_unknown',
        log.endNodeId ?? 'end_unknown',
        index + 10,
      ),
    )
  })

  return [...byOrder.values()]
})()

/** Map basename mock → SVG tĩnh trong /public/snapshots. */
export function mockSnapshotImageSrc(file: string): string {
  if (file.includes('pair-mock-b') || file.includes('tsk-8842')) {
    return '/snapshots/pair-placeholder-b.svg'
  }
  if (file.includes('failed') || file.includes('expired')) {
    return '/snapshots/tsk-failed.svg'
  }
  return '/snapshots/pair-placeholder.svg'
}

export function mockOrderSnapshots(orderId: string): OrderSnapshots {
  const found = orderSnapshotFixtures.find((item) => item.orderId === orderId)
  if (found) {
    return found
  }
  return { orderId, items: [] }
}
