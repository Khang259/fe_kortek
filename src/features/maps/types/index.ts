/** Bản zip map đã import (global version). */
export interface MapVersion {
  versionId: string
  originalFilename: string
  byteSize: number
  checksum: string
  createdAt: string
  createdBy: string
  isActive: boolean
}

export interface ListMapVersionsResponse {
  activeVersionId: string | null
  items: MapVersion[]
}

export interface ImportMapResult {
  versionId: string
  isActive: boolean
  pruned: string[]
  byteSize: number
  checksum: string
}

export interface SetActiveMapResult {
  versionId: string
  isActive: boolean
}

/**
 * Payload compress.json dạng columnar.
 * FE parse `*Keys` + `*Arr` — không ghép id compress với Mongo node.
 */
export interface CompressPayload {
  nodeKeys: string[]
  nodeArr: unknown[][]
  lineKeys: string[]
  lineArr: unknown[][]
  width: number
  height: number
  xAttrMin: number
  yAttrMin: number
}

export interface GetCompressResponse {
  versionId: string
  compress: CompressPayload
}

/**
 * Node đã parse để vẽ.
 * `type`: 0 = ẩn, 1 = hiện (điểm nghiệp vụ).
 * `kind`: nhãn hiển thị (start / end / waypoint / camera…).
 */
export interface CompressNode {
  x: number
  y: number
  /** 0 = ẩn; 1 = hiện. */
  type: number
  /** start / end / waypoint / camera… (màu / icon). */
  kind: string
  name: string
  /** Mã QR / content. */
  qr: string
  zone: string
  camera: string
  /** Điểm bắt cặp. */
  pairPoint: string
}

/** Điểm trên polyline compress. */
export interface CompressPoint {
  x: number
  y: number
}

/**
 * Line compress: ưu tiên `path` (polyline).
 * `from` / `to` = content id hai đầu (nếu có).
 */
export interface CompressLine {
  points: CompressPoint[]
  from: string
  to: string
}
