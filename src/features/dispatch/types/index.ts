export type ActiveTaskStatus = 'issued' | 'inprogress'

/**
 * Lệnh single đang hiển thị trên panel Dispatch.
 * @see docs/fe-api-active-tasks.md
 */
export interface ActiveTask {
  orderId: string
  startNodeId: string
  endNodeId: string
  /** Priority Mongo của start; `null` → sort cuối. */
  priorityStart: number | null
  status: ActiveTaskStatus
}

export type PairType = 'normal' | 'empty'

/** Tuyến Start–End; blocking do backend tính sẵn. Không có zoneId (xuyên zone OK). */
export interface NodePair {
  id: string
  name: string
  startNodeId: string
  /** Empty pair: `'_'`. */
  endNodeId: string
  pairType: PairType
  enabled: boolean
  autoDispatch: boolean
  isBlocked: boolean
  blockedReason: string | null
}

export interface PairWriteResult {
  id: string
  startNodeId: string
  endNodeId: string
  pairType?: PairType
  enabled?: boolean
  autoDispatch?: boolean
  name?: string
  runtimeReloaded: boolean
}
