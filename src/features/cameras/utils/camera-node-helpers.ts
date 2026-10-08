import { EMPTY_NODE_LOCK } from '@/features/nodes/utils/node-lock'
import {
  isEndNodeId,
  isStartNodeId,
} from '@/features/nodes/utils/node-priority'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError, NodeKind, WarehouseNode } from '@/types'

export function normalizeZone(zone: string) {
  return zone.trim().toUpperCase()
}

export function inferKindFromNodeId(nodeId: string): NodeKind | null {
  if (isStartNodeId(nodeId)) {
    return 'start'
  }
  if (isEndNodeId(nodeId)) {
    return 'end'
  }
  return null
}

/**
 * Mock: tạo WarehouseNode gắn camera rồi push vào fixture.
 * `name`: create_camera dùng `null`; update_camera dùng `nodeId`.
 */
export function createObservedNode(input: {
  nodeId: string
  cameraId: number
  zone: string
  priority: number
  name?: string | null
}): WarehouseNode {
  const kind = inferKindFromNodeId(input.nodeId)
  if (!kind) {
    const error: ApiError = {
      status: 400,
      message: `nodeId phải bắt đầu bằng start_ hoặc end_: ${input.nodeId}`,
    }
    throw error
  }

  const node: WarehouseNode = {
    id: input.nodeId,
    nodeId: input.nodeId,
    name: input.name === undefined ? null : input.name,
    label: '',
    kind,
    zoneId: input.zone,
    cameraId: input.cameraId,
    priority: input.priority,
    enabled: true,
    position: null,
    state: 'idle',
    isUnderMaintenance: false,
    maintenanceReason: null,
    lock: { ...EMPTY_NODE_LOCK },
  }
  nodeFixtures.push(node)
  return node
}

/** Map lỗi validateNewStartPriorities → ApiError (409 nếu trùng priority). */
export function toStartPriorityApiError(message: unknown): ApiError {
  return {
    status:
      typeof message === 'string' && message.includes('đã dùng') ? 409 : 400,
    message: String(message),
  }
}
