import type { CompressNode } from '@/features/maps/types'
import { isCompressCameraName } from '@/features/maps/utils/parse-compress'

/**
 * Ngưỡng LOD (Level of Detail) theo zoom viewport.
 * - zoom < IMPORTANT → chỉ đường (polyline), ẩn mọi marker
 * - IMPORTANT ≤ zoom < ALL → start / end / camera
 * - zoom ≥ ALL → mọi node (waypoint…)
 */
export const MAP_LOD = {
  important: 1,
  all: 2,
} as const

const IMPORTANT_KINDS = new Set(['start', 'end', 'camera'])

/** Marker có hiện ở mức zoom hiện tại không (đường luôn hiện riêng). */
export function isNodeVisibleAtZoom(node: CompressNode, zoom: number) {
  if (zoom < MAP_LOD.important) {
    return false
  }

  const isImportant =
    IMPORTANT_KINDS.has(node.kind) || isCompressCameraName(node.name)

  if (zoom < MAP_LOD.all) {
    return isImportant
  }

  return true
}

/**
 * Counter-scale: bù `scale(zoom)` của viewport để kích thước marker trên màn hình ổn định.
 * Path/line không dùng hàm này — vẫn phóng theo zoom để thấy rõ đường.
 */
export function counterScaleMarkerR(baseR: number, zoom: number) {
  return baseR / Math.max(zoom, 0.01)
}
