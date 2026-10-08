export type ActionResult = 'success' | 'failed'

/** Audit / auth events — `action` là mã tự do từ backend. */
export interface AuditLog {
  id: string
  userName: string
  role: string
  action: string
  ipAddress: string
  device: string
  occurredAt: string
}

/** Thao tác FE ghi qua /api/v1 (ROI, maintenance, camera…). */
export interface UserActionLog {
  id: string
  userName: string
  role: string
  action: string
  endpoint: string
  ipAddress: string
  /** HTTP status của request gốc. */
  status: number
  occurredAt: string
  changes: unknown
  payload: unknown
}

/**
 * System action — outbound ICS (`dispatch`) + webhook
 * `POST /external_server/unlock_by_order_status` (body phẳng, status string).
 * FE không gọi webhook; chỉ đọc log + nhận SSE panel.
 * @see docs/fe-api-unlock-by-order-status.md
 * @see docs/fe-api-system-action-logs.md
 */
export interface SystemActionLog {
  id: string
  orderId: string | null
  /** `dispatch` | `unlock_by_order_status` (BE có thể thêm sau). */
  action: string
  result: ActionResult | string
  errorMessage: string | null
  startNodeId: string | null
  endNodeId: string | null
  zoneId: string | null
  durationMs: number | null
  occurredAt: string | null
  externalSource: string
  /** URL ICS (outbound) hoặc path webhook. */
  endpoint: string | null
  requestPayload: unknown
  responsePayload: unknown
}

export interface LogListParams {
  from?: string
  to?: string
  page: number
  pageSize: number
  /** Chỉ dùng phía mock / nếu BE hỗ trợ cho system logs. */
  result?: string
  /** FE filter mock: `dispatch` | `unlock_by_order_status` (BE chưa có query). */
  action?: string
}
