import { env } from '@/config/env'
import type {
  NodeRuntimeItem,
  NodeRuntimeSnapshot,
} from '@/features/nodes/types/runtime'
import { EMPTY_NODE_LOCK, normalizeNodeLock } from '@/features/nodes/utils/node-lock'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { nodeRuntimeSnapshotFixture } from '@/testing/fixtures/node-runtime'

function normalizeItem(raw: Record<string, unknown>): NodeRuntimeItem | null {
  const nodeId =
    typeof raw.nodeId === 'string'
      ? raw.nodeId
      : typeof raw.node_id === 'string'
        ? raw.node_id
        : null
  if (!nodeId) {
    return null
  }
  return {
    nodeId,
    detected: Boolean(raw.detected),
    isReady: Boolean(raw.isReady ?? raw.is_ready),
    lock: normalizeNodeLock(raw.lock),
  }
}

function normalizeSnapshot(data: {
  runtimeReady?: boolean
  items?: unknown[]
}): NodeRuntimeSnapshot {
  const items = Array.isArray(data.items)
    ? data.items
        .map((item) =>
          item && typeof item === 'object'
            ? normalizeItem(item as Record<string, unknown>)
            : null,
        )
        .filter((item): item is NodeRuntimeItem => item !== null)
    : []

  return {
    runtimeReady: Boolean(data.runtimeReady),
    items,
  }
}

/**
 * `GET /nodes/get_runtime_state` — snapshot RAM toàn bộ nodes.
 * `runtimeReady: false` + items [] là bình thường (không toast 500).
 */
export async function fetchNodeRuntimeState(): Promise<NodeRuntimeSnapshot> {
  if (env.useMockApi) {
    return mockRequest(nodeRuntimeSnapshotFixture(), 150)
  }

  const { data } = await apiClient.get<{
    runtimeReady?: boolean
    items?: unknown[]
  }>('/nodes/get_runtime_state')

  return normalizeSnapshot(data ?? { runtimeReady: false, items: [] })
}

export function emptyRuntimeItem(nodeId: string): NodeRuntimeItem {
  return {
    nodeId,
    detected: false,
    isReady: false,
    lock: { ...EMPTY_NODE_LOCK },
  }
}

export { normalizeSnapshot as normalizeNodeRuntimeSnapshot }
