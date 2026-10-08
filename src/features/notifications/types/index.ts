/**
 * Thông báo của user hiện tại + broadcast.
 * `type` = mã sự kiện backend (vd. dispatch.failed), không phải severity.
 *
 * NOTE (2026-10-01): BE **không còn tạo mới** `dispatch.failed` từ PairManager.
 * Fail ICS xem trong `get_system_action_logs`. Bản ghi cũ trong DB vẫn list được.
 * @see docs/fe-api-system-action-logs.md
 */
export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  /** null = chưa đọc. */
  readAt: string | null
  meta: Record<string, unknown>
  /**
   * Path tương đối dạng `/api/v1/snapshots/get_image?file=...`
   * hoặc null khi hết hạn / không gắn file.
   */
  snapshotImageUrl: string | null
}

export const DISPATCH_FAILED_TYPE = 'dispatch.failed'

export function isNotificationUnread(notification: AppNotification) {
  return notification.readAt === null
}

export function isDispatchFailedNotification(notification: AppNotification) {
  return notification.type === DISPATCH_FAILED_TYPE
}

/** Meta ICS fail — không phụ thuộc ảnh snapshot. */
export function getDispatchFailedMeta(notification: AppNotification) {
  const startNodeId =
    typeof notification.meta.startNodeId === 'string'
      ? notification.meta.startNodeId
      : null
  const endNodeId =
    typeof notification.meta.endNodeId === 'string'
      ? notification.meta.endNodeId
      : null
  const orderId =
    typeof notification.meta.orderId === 'string'
      ? notification.meta.orderId
      : null

  return { startNodeId: startNodeId ?? '—', endNodeId: endNodeId ?? '—', orderId }
}
