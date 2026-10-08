import type { NodeLock } from '@/types'

/**
 * Trạng thái vận hành node trên RAM (PairManager).
 * @see docs/fe-api-node-runtime.md
 */
export interface NodeRuntimeItem {
  nodeId: string
  /** Node đang “thấy” vật thể (= state RAM). */
  detected: boolean
  /** Node nằm trong ready_start_list / ready_end_list. */
  isReady: boolean
  lock: NodeLock
}

export interface NodeRuntimeSnapshot {
  /** false = runtime chưa bind NodeState — UI “đang khởi động”. */
  runtimeReady: boolean
  items: NodeRuntimeItem[]
}
