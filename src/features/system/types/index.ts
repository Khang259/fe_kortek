import type { StatusTone } from '@/types'

export type RuntimeStatus = 'healthy' | 'degraded'

export interface SystemConfigEntry {
  id: string
  label: string
  value: string
}

export interface SystemConfig {
  runtimeStatus: RuntimeStatus
  entries: SystemConfigEntry[]
}

/** Đèn tín hiệu sức khoẻ hiển thị trên topbar. */
export interface HealthIndicator {
  id: string
  label: string
  tone: StatusTone
  /** Tooltip / dòng phụ (vd. message khi degraded). */
  detail?: string
}

/** Body `GET /system/get_health` (200 hoặc 503). */
export interface SystemHealth {
  status: 'ok' | 'degraded' | string
  service: string
  mongo: boolean
  runtime_running: boolean
  webrtc: {
    alive: boolean
    owned: boolean
    watchdog: boolean
  }
  message?: string
}

/** Lý do cổng batch đóng gần nhất — `GET /runtime/get_pending_pairs`. */
export type BatchStopReason =
  | 'batch_complete'
  | 'new_nodes'
  | 'canceled'
  | null

/** Snapshot batch gửi ICS. */
export interface PendingBatch {
  active: boolean
  size: number
  nodes: string[]
  dispatched: string[]
  /** Start bị skip trong batch (head col không vào batch). */
  skipped: string[]
  remaining: number
  stopReason: BatchStopReason
  /** Legacy — node mới từng dừng batch. Ưu tiên `newNodesOutsideBatch`. */
  newNodes: string[]
}

/** Start đang isReady — xem trước batch sẽ chụp. */
export interface ReadyStart {
  nodeId: string
  priority: number
  zoneId: string
  /** Cột trong zone — sort ASC trước priority. */
  colId: string
  inBatch: boolean
  dispatched: boolean
  skipped: boolean
}

/** Cặp sẽ gửi ở vòng kế. */
export interface NextPair {
  startNodeId: string
  endNodeId: string
}

/** Head zone/col đang chặn — chưa gửi được. */
export interface WaitingForItem {
  zoneId: string
  colId?: string
  nodeId: string
  reason?: string
}

/** Head từng col — `GET /runtime/get_pending_pairs`. */
export interface ColStatusItem {
  zoneId: string
  colId: string
  headNodeId: string
  headInBatch: boolean
}

/** Body `GET /runtime/get_pending_pairs`. */
export interface PendingPairsResponse {
  runtimeReady: boolean
  batch: PendingBatch
  readyStarts: ReadyStart[]
  nextPairs: NextPair[]
  waitingFor: WaitingForItem[]
  /** Start trong batch, chưa gửi, mất isReady — nghi mất hàng. */
  stuckNodes: string[]
  /** Head từng col trong zone. */
  colStatus: ColStatusItem[]
  /**
   * Node mới ready ngoài batch — chỉ thông tin, không dừng gửi.
   * Cần dispatch lại ở batch sau.
   */
  newNodesOutsideBatch: string[]
}

/** Body `POST /runtime/dispatch` (alias cũ confirm-dispatch) 200. */
export interface ConfirmDispatchResult {
  message: string
  batchSize: number
  batchNodes: string[]
}

/** Alias contract — cùng shape ConfirmDispatchResult. */
export type DispatchResult = ConfirmDispatchResult

/** Body `POST /system/start-cameras` 200. */
export interface StartCamerasResult {
  message: string
  total: number
  enabled: number
  streaming: number
  scanning: boolean
  cameras: unknown[]
  warnings: string[]
}

/** Body `POST /runtime/cancel-batch` 200. */
export interface CancelBatchResult {
  message: string
  dispatched: string[]
  remaining: string[]
}
