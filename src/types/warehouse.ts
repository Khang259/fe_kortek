/**
 * Node / zone dùng chung nhiều feature → type tầng global.
 * `id` / `zoneId` = id thật từ backend (Mongo / zone code), không phải label.
 */

/** Mã zone dạng AE5 — không hardcode union cố định. */
export type ZoneId = string

export type NodeKind = 'start' | 'end'

/**
 * Trạng thái hàng trên node — API đợt 2–3 chưa trả.
 * FE mặc định `idle` cho tới khi có field từ backend.
 */
export type NodeState = 'cargo' | 'clear' | 'idle'

/**
 * Khóa điểm — user (operator) và/hoặc system (sau ICS thành công).
 * PairManager chặn nếu `user` hoặc `system`.
 */
export interface NodeLock {
  user: boolean
  system: boolean
  /** Có khi `system=true` — order ICS liên quan. */
  orderId: string | null
}

export interface WarehouseNode {
  id: string
  /** Trùng `id` — giữ để khớp payload API. */
  nodeId: string
  /**
   * Tên Mongo / content. Ưu tiên hiển thị.
   * Fallback UI = `nodeId` (không dùng nhãn tạm kiểu S-01).
   */
  name: string | null
  /**
   * Field API (nếu BE còn trả). FE không hardcode / không ưu tiên hiển thị.
   */
  label: string
  kind: NodeKind
  zoneId: ZoneId
  cameraId: number | null
  priority: number
  enabled: boolean
  /**
   * Toạ độ % trên map. API hiện luôn null → sơ đồ có thể trống.
   */
  position: { x: number; y: number } | null
  /** FE-only cho tới khi backend có field; mặc định idle. */
  state: NodeState
  lock: NodeLock
  isUnderMaintenance: boolean
  maintenanceReason: string | null
}

export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
