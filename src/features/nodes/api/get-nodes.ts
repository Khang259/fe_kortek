import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchList } from '@/lib/api-request'
import { isNodeLocked, normalizeNodeLock } from '@/features/nodes/utils/node-lock'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { WarehouseNode } from '@/types'

export const nodeKeys = {
  all: ['nodes'] as const,
  list: (zoneId?: string) =>
    [...nodeKeys.all, 'list', zoneId ?? 'all'] as const,
}

/** Bổ sung field FE-only / alias khi backend chưa trả đủ. */
function normalizeNode(item: WarehouseNode): WarehouseNode {
  const id = item.id ?? item.nodeId
  const raw = item as WarehouseNode & { commandLock?: unknown }
  return {
    ...item,
    id,
    nodeId: item.nodeId ?? id,
    name: item.name ?? null,
    label: item.label?.trim() || '',
    state: item.state ?? 'idle',
    lock: normalizeNodeLock(raw.lock ?? raw.commandLock),
    position: item.position ?? null,
    maintenanceReason: item.maintenanceReason ?? null,
  }
}

const getNodes = async (zoneId?: string) => {
  const items = await fetchList<WarehouseNode>(
    '/nodes/get_nodes',
    zoneId
      ? nodeFixtures.filter((node) => node.zoneId === zoneId)
      : nodeFixtures,
    zoneId ? { zoneId } : undefined,
  )
  return items.map(normalizeNode)
}

export const nodesQueryOptions = (zoneId?: string) =>
  queryOptions({
    queryKey: nodeKeys.list(zoneId),
    queryFn: () => getNodes(zoneId),
  })

/** Poll get_nodes — lock user/system + state (không WebSocket). */
const NODE_POLL_MS = 2_000

export const useNodes = (zoneId?: string) =>
  useQuery({
    ...nodesQueryOptions(zoneId),
    refetchInterval: NODE_POLL_MS,
  })

export const useCargoNodeCount = () =>
  useQuery({
    ...nodesQueryOptions(),
    select: (nodes) => nodes.filter((node) => node.state === 'cargo').length,
    refetchInterval: NODE_POLL_MS,
  })

/** Số node đang bị khóa (user hoặc system). */
export const useLockedNodeCount = () =>
  useQuery({
    ...nodesQueryOptions(),
    select: (nodes) => nodes.filter((node) => isNodeLocked(node.lock)).length,
    refetchInterval: NODE_POLL_MS,
  })
