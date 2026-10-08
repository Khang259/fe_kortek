import type {
  CompressLine,
  CompressNode,
  CompressPayload,
} from '@/features/maps/types'

function rowToRecord(keys: string[], row: unknown[]) {
  const record: Record<string, unknown> = {}
  keys.forEach((key, index) => {
    record[key] = row[index]
  })
  return record
}

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asString(value: unknown, fallback = '') {
  return value == null ? fallback : String(value)
}

function firstString(
  record: Record<string, unknown>,
  keys: string[],
  fallback = '',
) {
  for (const key of keys) {
    if (record[key] != null && String(record[key]).trim() !== '') {
      return String(record[key])
    }
  }
  return fallback
}

/** Tên compress dạng `Cam-1`, `Cam-12`… */
const CAM_NAME_RE = /^Cam-(\d+)$/i

export function isCompressCameraName(name: string) {
  return CAM_NAME_RE.test(name.trim())
}

/** `Cam-3` → 3 (khớp cameraId). */
export function parseCamIndex(name: string): number | null {
  const match = CAM_NAME_RE.exec(name.trim())
  if (!match) {
    return null
  }
  return Number(match[1])
}

/**
 * Chỉ vẽ:
 * - camera (`Cam-*`) — luôn hiện
 * - node với `type === 1`
 */
export function isCompressNodeVisible(node: CompressNode) {
  if (isCompressCameraName(node.name)) {
    return true
  }
  return node.type === 1
}

function isNumericFlag(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value)
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(Number(value))
  }
  return false
}

function parseNode(record: Record<string, unknown>): CompressNode {
  const name = asString(record.name, '')
  const isCamera = isCompressCameraName(name)

  /**
   * `type` số (0/1) = cờ hiện/ẩn.
   * `type` chữ (start/end…) = kind; lúc đó đọc thêm nodeType nếu có.
   */
  const rawType = record.type
  const typeIsFlag = isNumericFlag(rawType)

  const type = typeIsFlag
    ? asNumber(rawType, isCamera ? 1 : 0)
    : asNumber(
        record.nodeType ?? record.node_type ?? record.NodeType,
        isCamera ? 1 : 0,
      )

  const kind = typeIsFlag
    ? asString(record.kind ?? record.nodeKind ?? record.label, isCamera ? 'camera' : 'node')
    : asString(rawType, isCamera ? 'camera' : 'node')

  return {
    x: asNumber(record.x),
    y: asNumber(record.y),
    type,
    kind,
    name,
    qr: firstString(record, ['qr', 'qrCode', 'QR', 'content']),
    zone: firstString(record, ['zone', 'zoneId', 'zoneName', 'area']),
    camera: firstString(record, [
      'camera',
      'cameraId',
      'cameraName',
      'cam',
    ]),
    pairPoint: firstString(record, [
      'pairPoint',
      'pair',
      'bindPoint',
      'matchedPoint',
      'pairing',
      'pairNode',
    ]),
  }
}

/** Bỏ line không đủ điểm để vẽ. */
export function filterValidLines(lines: CompressLine[]): CompressLine[] {
  return lines.filter((line) => line.points.length >= 2)
}

function parsePathPoints(raw: unknown): { x: number; y: number }[] {
  if (!Array.isArray(raw)) {
    return []
  }

  const points: { x: number; y: number }[] = []
  for (const item of raw) {
    if (Array.isArray(item) && item.length >= 2) {
      const x = asNumber(item[0], Number.NaN)
      const y = asNumber(item[1], Number.NaN)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push({ x, y })
      }
      continue
    }
    if (item && typeof item === 'object') {
      const row = item as Record<string, unknown>
      const x = asNumber(row.x ?? row[0], Number.NaN)
      const y = asNumber(row.y ?? row[1], Number.NaN)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push({ x, y })
      }
    }
  }
  return points
}

/** Hỗ trợ format zip thật (`path`/`from`/`to`) và mock cũ (`x1,y1,x2,y2`). */
function parseLine(record: Record<string, unknown>): CompressLine | null {
  const from = asString(record.from ?? record.start ?? record.fromId, '')
  const to = asString(record.to ?? record.end ?? record.toId, '')

  let points = parsePathPoints(record.path ?? record.points ?? record.coords)

  if (points.length < 2) {
    const x1 = asNumber(record.x1 ?? record.startX, Number.NaN)
    const y1 = asNumber(record.y1 ?? record.startY, Number.NaN)
    const x2 = asNumber(record.x2 ?? record.endX, Number.NaN)
    const y2 = asNumber(record.y2 ?? record.endY, Number.NaN)
    if (
      Number.isFinite(x1) &&
      Number.isFinite(y1) &&
      Number.isFinite(x2) &&
      Number.isFinite(y2)
    ) {
      points = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ]
    }
  }

  if (points.length < 2) {
    return null
  }

  return { points, from, to }
}

export interface MapBounds {
  x: number
  y: number
  width: number
  height: number
}

/** Biên compress gốc (không pad). */
export function getCompressBounds(compress: CompressPayload): MapBounds {
  return {
    x: compress.xAttrMin,
    y: compress.yAttrMin,
    width: compress.width,
    height: compress.height,
  }
}

/**
 * Bao biên compress + node/line, thêm padding để marker/viền không bị cắt.
 * (*padding* = khoảng đệm quanh nội dung trong hệ toạ độ map.)
 */
export function buildContentBounds(
  compress: CompressPayload,
  nodes: CompressNode[],
  lines: CompressLine[],
): MapBounds {
  let minX = compress.xAttrMin
  let minY = compress.yAttrMin
  let maxX = compress.xAttrMin + compress.width
  let maxY = compress.yAttrMin + compress.height

  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x)
    maxY = Math.max(maxY, node.y)
  }

  for (const line of lines) {
    for (const point of line.points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  }

  const span = Math.max(maxX - minX, maxY - minY, 1)
  const markerPad = span * 0.008 * 2.5
  const percentPad = span * 0.04
  const pad = Math.max(markerPad, percentPad)

  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  }
}

/**
 * Mở rộng bounds theo tỉ lệ viewport để SVG `meet` phủ kín khung
 * (không letterbox). Nội dung vẫn nằm giữa.
 */
export function fitBoundsToViewport(
  content: MapBounds,
  viewportWidth: number,
  viewportHeight: number,
): MapBounds {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return content
  }

  const contentAspect = content.width / Math.max(content.height, 1)
  const viewportAspect = viewportWidth / viewportHeight

  if (viewportAspect > contentAspect) {
    const width = content.height * viewportAspect
    return {
      x: content.x - (width - content.width) / 2,
      y: content.y,
      width,
      height: content.height,
    }
  }

  const height = content.width / viewportAspect
  return {
    x: content.x,
    y: content.y - (height - content.height) / 2,
    width: content.width,
    height,
  }
}

export function boundsToViewBox(bounds: MapBounds): string {
  return [bounds.x, bounds.y, bounds.width, bounds.height].join(' ')
}

/** Columnar compress → danh sách node/line để vẽ SVG. */
export function parseCompress(compress: CompressPayload): {
  nodes: CompressNode[]
  lines: CompressLine[]
  /** viewBox gốc = biên compress (không pad). */
  viewBox: string
} {
  const nodes = compress.nodeArr.map((row) =>
    parseNode(rowToRecord(compress.nodeKeys, row)),
  )

  const lines = compress.lineArr
    .map((row) => parseLine(rowToRecord(compress.lineKeys, row)))
    .filter((line): line is CompressLine => line !== null)

  const viewBox = boundsToViewBox(getCompressBounds(compress))

  return { nodes, lines, viewBox }
}
