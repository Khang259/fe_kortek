import type { NodeRuntimeItem } from '@/features/nodes/types/runtime'

/** Màu marker map — khớp NodeMapLegend. */
export const MAP_STATUS_FILL = {
  detected: '#3b82f6',
  undetected: '#f59e0b',
  /** Join Mongo được nhưng chưa có runtime → ẩn status. */
  unknown: '#64748b',
  path: '#94a3b8',
} as const

export type MapNodeVisualStatus = keyof typeof MAP_STATUS_FILL

/**
 * Có runtime → detected/undetected; chưa có item runtime → unknown.
 */
export function resolveMapNodeStatus(
  runtime: NodeRuntimeItem | undefined,
): 'detected' | 'undetected' | 'unknown' {
  if (!runtime) {
    return 'unknown'
  }
  return runtime.detected ? 'detected' : 'undetected'
}
