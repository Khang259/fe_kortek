import type { WarehouseNode } from '@/types'

/** colId hợp lệ: chuỗi không rỗng (sort `"A" < "B"`). */
export function isValidColId(value: string) {
  return value.trim().length > 0
}

/** Normalize / trim colId; rỗng → null. */
export function normalizeColId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Validate nodeColIds khi tạo start mới.
 * @throws message string (caller gói ApiError)
 */
export function validateNewStartColIds(input: {
  newStartIds: string[]
  nodeColIds?: Record<string, string>
}): void {
  const { newStartIds, nodeColIds = {} } = input
  if (newStartIds.length === 0) {
    return
  }

  for (const nodeId of newStartIds) {
    if (!(nodeId in nodeColIds)) {
      throw `start ${nodeId} requires nodeColIds["${nodeId}"]`
    }
    if (!isValidColId(nodeColIds[nodeId] ?? '')) {
      throw `start ${nodeId} requires non-empty colId`
    }
  }
}

/** So sánh start theo colId ASC rồi priority ASC (trong cùng zone). */
export function compareStartsByColThenPriority(
  a: WarehouseNode,
  b: WarehouseNode,
) {
  if (a.zoneId !== b.zoneId) {
    return a.zoneId.localeCompare(b.zoneId)
  }
  const colA = a.colId ?? ''
  const colB = b.colId ?? ''
  if (colA !== colB) {
    return colA.localeCompare(colB)
  }
  if (a.priority !== b.priority) {
    return a.priority - b.priority
  }
  return a.id.localeCompare(b.id)
}
