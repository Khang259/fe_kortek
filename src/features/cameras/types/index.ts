import type { NodeKind, ZoneId } from '@/types'

/**
 * offline = mất kết nối / runtime chưa lên.
 * disabled = Mongo enabled=false.
 * streaming = đang có frame.
 */
export type CameraStatus = 'streaming' | 'offline' | 'disabled'

export interface Camera {
  /** Alias của cameraId — giữ `id` để UI cũ khỏi đổi hàng loạt. */
  id: number
  cameraId: number
  name: string
  rtspUrl: string
  zone: ZoneId
  /** Codec / container stream (vd. H264, MJPEG). */
  format: string
  resolution: string
  observedNodeIds: string[]
  status: CameraStatus
  enabled: boolean
  error: string | null
  /** API hiện luôn null. */
  mapPosition: { x: number; y: number } | null
}

/** Khung ROI tham chiếu mặc định của pipeline. */
export const ROI_REF_WIDTH = 640
export const ROI_REF_HEIGHT = 480

/** [x, y, w, h] pixel trong khung 640×480. */
export type RoiBox = [number, number, number, number]

export interface CameraRoi {
  /** Dạng `{cameraId}:{nodeId}`. */
  id: string
  cameraId: number
  nodeId: string
  label: string
  kind: NodeKind
  box: RoiBox
  refWidth: number
  refHeight: number
}

export interface RoiDraft {
  key: string
  id: string | null
  nodeId: string
  box: RoiBox
}

export interface CameraFilters {
  search: string
  zone: string
  status: string
}
