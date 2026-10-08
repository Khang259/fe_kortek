import type { WarehouseNode } from '@/types'

/**
 * Join compress → Mongo: `compress.name === mongo.nodeId`.
 * Không khớp → không vẽ marker nghiệp vụ (camera vẫn vẽ riêng).
 */
export function findWarehouseByCompressName(
  compressName: string,
  nodesByNodeId: Map<string, WarehouseNode>,
): WarehouseNode | undefined {
  const key = compressName.trim()
  if (!key) {
    return undefined
  }
  return nodesByNodeId.get(key)
}

/** Index Mongo theo nodeId để lookup O(1). */
export function indexNodesByNodeId(nodes: WarehouseNode[]) {
  const map = new Map<string, WarehouseNode>()
  nodes.forEach((node) => {
    const key = node.nodeId?.trim()
    if (key) {
      map.set(key, node)
    }
  })
  return map
}
