/** Mode WHEP — preview (ROI) hoặc detect (map + overlay meta). */
export type WebRtcMode = 'preview' | 'detect'

export type WebRtcPhase = 'idle' | 'connecting' | 'live' | 'error'

export interface WebRtcIceResponse {
  iceServers: RTCIceServer[]
}

export interface WebRtcStatus {
  count: number
  max: number
}

/** Lỗi JSON chuẩn `/api/v1` — HTTP status + `{ message }`. */
export interface WhepErrorBody {
  message?: string
}

/** Overlay detect — tọa độ trong không gian infer `w`×`h`. */
export interface PreviewMeta {
  w: number
  h: number
  ts: number
  rois: Array<{
    node_id: string
    roi: [number, number, number, number]
  }>
  dets: Array<{
    /** Label hoặc class id — FE luôn normalize thành string khi fetch. */
    cls: string
    conf: number
    xyxy: [number, number, number, number]
  }>
}
