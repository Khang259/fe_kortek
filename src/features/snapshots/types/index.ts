/**
 * Meta snapshot gắn order sau dispatch Single OK.
 * @see docs/fe-api-dispatch-snapshots.md
 */
export type SnapshotNodeType = 'start' | 'end'

export interface SnapshotItem {
  orderId: string
  nodeId: string
  nodeType: SnapshotNodeType
  zoneId: string
  /** Basename trong SNAPSHOT_DIR — truyền vào get_image. */
  imagePath: string
  /** Path relative API; `null` nếu chưa ghép được. */
  imageUrl: string | null
  decision: string
  createdAt: string
}

export interface OrderSnapshots {
  orderId: string
  items: SnapshotItem[]
}
