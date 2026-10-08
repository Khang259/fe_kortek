import type { WarehouseNode } from '@/types'

/** Start node id — `start_*`. */
export function isStartNodeId(nodeId: string) {
  return nodeId.startsWith('start_')
}

/** End node id — `end_*`. */
export function isEndNodeId(nodeId: string) {
  return nodeId.startsWith('end_')
}

/** Priority đang dùng bởi start trong zone (unique theo zone). */
export function usedStartPrioritiesInZone(
  nodes: WarehouseNode[],
  zoneId: string,
  excludeNodeId?: string,
): Set<number> {
  const used = new Set<number>()
  nodes.forEach((node) => {
    if (node.kind !== 'start') {
      return
    }
    if (node.zoneId !== zoneId) {
      return
    }
    if (excludeNodeId && node.id === excludeNodeId) {
      return
    }
    used.add(node.priority)
  })
  return used
}

/** Gợi ý priority tiếp theo (>= 0) chưa dùng trong zone. */
export function suggestNextStartPriority(
  nodes: WarehouseNode[],
  zoneId: string,
): number {
  const used = usedStartPrioritiesInZone(nodes, zoneId)
  let next = 0
  while (used.has(next)) {
    next += 1
  }
  return next
}

/**
 * Parse `start_a=1, start_b=2` → map.
 * Bỏ qua entry không hợp lệ.
 */
export function parseNodePrioritiesText(
  text: string,
): Record<string, number> {
  const map: Record<string, number> = {}
  text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf('=')
      if (eq <= 0) {
        return
      }
      const nodeId = part.slice(0, eq).trim()
      const raw = Number(part.slice(eq + 1).trim())
      if (!nodeId || !Number.isInteger(raw) || raw < 0) {
        return
      }
      map[nodeId] = raw
    })
  return map
}

export function formatNodePrioritiesText(
  priorities: Record<string, number>,
): string {
  return Object.entries(priorities)
    .map(([nodeId, priority]) => `${nodeId}=${priority}`)
    .join(', ')
}

/**
 * Validate nodePriorities khi tạo start mới.
 * @throws message string (để gói ApiError ở caller)
 */
export function validateNewStartPriorities(input: {
  newStartIds: string[]
  nodePriorities?: Record<string, number>
  zoneId: string
  existingNodes: WarehouseNode[]
}): void {
  const { newStartIds, nodePriorities = {}, zoneId, existingNodes } = input
  if (newStartIds.length === 0) {
    return
  }

  const used = usedStartPrioritiesInZone(existingNodes, zoneId)
  const batchUsed = new Set<number>()

  for (const nodeId of newStartIds) {
    if (!(nodeId in nodePriorities)) {
      throw `start ${nodeId} requires nodePriorities["${nodeId}"]`
    }
    const priority = nodePriorities[nodeId]
    if (!Number.isInteger(priority) || priority < 0) {
      throw 'priority must be >= 0'
    }
    if (used.has(priority) || batchUsed.has(priority)) {
      const owner =
        existingNodes.find(
          (node) =>
            node.kind === 'start' &&
            node.zoneId === zoneId &&
            node.priority === priority,
        )?.id ?? 'batch'
      throw `priority ${priority} already used by start ${owner} in zone ${zoneId}`
    }
    batchUsed.add(priority)
  }
}

/** Label hạng từ priority — S-01, S-02… */
export function formatStartPriorityLabel(priority: number) {
  return `S-${String(Math.max(0, priority)).padStart(2, '0')}`
}
