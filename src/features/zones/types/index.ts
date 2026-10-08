/**
 * Zone dưới dạng thực thể có trạng thái vận hành.
 * `id` gửi lên API (AE5…); `name` chỉ để hiển thị.
 *
 * @see docs/fe-zones-runtime-flags.md
 */
export interface WarehouseZone {
  id: string
  name: string
  /** ≥1 camera zone `enabled` trong RAM (công tắc — có thể chưa có frame). */
  isRunning: boolean
  /** ≥1 camera zone đã RTSP OK + có frame. */
  isStreaming: boolean
  /** zones.enabled trong Mongo. */
  isConfigEnabled: boolean
  nodeCount: number
  cameraCount: number
  lastChangedAt: string | null
  lastChangedBy: string | null
}
