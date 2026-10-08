import {
  ROI_REF_HEIGHT,
  ROI_REF_WIDTH,
  type RoiBox,
} from '@/features/cameras/types'

/** Chuyển box pixel → % CSS cho overlay. */
export function roiBoxToCssPercent([x, y, w, h]: RoiBox) {
  return {
    left: `${(x / ROI_REF_WIDTH) * 100}%`,
    top: `${(y / ROI_REF_HEIGHT) * 100}%`,
    width: `${(w / ROI_REF_WIDTH) * 100}%`,
    height: `${(h / ROI_REF_HEIGHT) * 100}%`,
  }
}

/** Từ tỷ lệ 0–1 (kéo chuột) → pixel xywh, làm tròn và clamp trong khung. */
export function relativeRectToRoiBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): RoiBox {
  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  const right = Math.max(x1, x2)
  const bottom = Math.max(y1, y2)

  let x = Math.round(left * ROI_REF_WIDTH)
  let y = Math.round(top * ROI_REF_HEIGHT)
  let w = Math.round((right - left) * ROI_REF_WIDTH)
  let h = Math.round((bottom - top) * ROI_REF_HEIGHT)

  x = Math.max(0, Math.min(x, ROI_REF_WIDTH - 1))
  y = Math.max(0, Math.min(y, ROI_REF_HEIGHT - 1))
  w = Math.max(1, Math.min(w, ROI_REF_WIDTH - x))
  h = Math.max(1, Math.min(h, ROI_REF_HEIGHT - y))

  return [x, y, w, h]
}

export function isValidRoiBox([x, y, w, h]: RoiBox) {
  return (
    x >= 0 &&
    y >= 0 &&
    w > 0 &&
    h > 0 &&
    x + w <= ROI_REF_WIDTH &&
    y + h <= ROI_REF_HEIGHT
  )
}

/** "80, 120, 140, 90" — xywh pixel. */
export const formatRoiBox = (box: RoiBox) => box.join(', ')
