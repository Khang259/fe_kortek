import type { WarehouseNode } from '@/types'

/**
 * Tên hiển thị node: Mongo `name`, không dùng nhãn tạm kiểu S-01.
 * Fallback = `nodeId` / `id`.
 */
export function getNodeDisplayName(
  node: Pick<WarehouseNode, 'id' | 'nodeId' | 'name'> | null | undefined,
): string {
  const name = node?.name?.trim()
  if (name) {
    return name
  }
  return node?.nodeId?.trim() || node?.id || '—'
}
